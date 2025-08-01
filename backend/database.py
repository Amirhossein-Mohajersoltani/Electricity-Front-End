import pymysql
from pymysql.cursors import DictCursor
from config import Config

import pandas as pd
import jdatetime
import requests

#    fidder_id  is_off        date     H1  ...    H21    H22    H23    H24
# 0        1.0     1.0  2024-03-20   31.0  ...   32.0   33.4   32.8   33.4
# 1        1.0     1.0  2024-03-21    NaN  ...  171.2  168.4  168.6  186.2
# 2        1.0     1.0  2024-03-22  169.2  ...  427.4  101.8  441.6  442.2
# 3        1.0     1.0  2024-03-23  440.6  ...  286.8  438.6  461.2  476.4
# 4        1.0     0.0  2024-03-24  493.4  ...  507.6  486.0  485.2  487.4


def make_format(csv_file):
    df = pd.read_csv(csv_file)
    df['تاریخ'] = df['تاریخ'].astype(str)


    # reformat the date series
    holidays = []
    fidder_code = []

    for index, date in df["تاریخ"][0:6].items():
        date = str(date)
        year = date[0:4]
        month = date[4:6]
        day = date[6:8]
        date = f"{year}-{month}-{day}"
        jalali_date = jdatetime.datetime.strptime(date, '%Y-%m-%d')
        new_date = str(jalali_date.togregorian()).split()[0]

        j_date = str(jalali_date).split()[0]
        df.loc[index, "تاریخ"] = new_date

        # https://holidayapi.ir/jalali/{year}}/{month}/{day}
        response = requests.get(f"https://holidayapi.ir/jalali/{year}/{month}/{day}")
        is_holiday = response.json()["is_holiday"]
        holidays.append(1 if is_holiday else 0)
        fidder_code.append(1)


    # add is_off column to dataframe
    holiday_series = pd.Series(holidays)
    fidder_series = pd.Series(fidder_code)

    df.rename(columns={"تاریخ": "date"}, inplace=True)

    df.insert(0, "fidder_id", fidder_series)
    df.insert(1, "is_off", holiday_series)

    return df

class Database:
    def __init__(self):
        self.host = Config.DB_HOST
        self.port = Config.DB_PORT
        self.user = Config.DB_USER
        self.password = Config.DB_PASSWORD
        self.database = Config.DB_NAME

    def is_user(self, email, password):
        try:
            connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=DictCursor,    # ← اینجا اضافه کنید
            )
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT password, distribution_id FROM users WHERE email = %s", (email,))
                    user = cursor.fetchone()
                    if user is None:
                        return (False, "invalid email/username")
                    elif user["password"] != password:
                        return (False, "invalid password")
                    else:
                        return (True, user["distribution_id"])
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return (False, "database error")

    def get_connection(self):
        connection = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection

    def add_user(self, id, name, email, password, role_id=None, distribution_id=None):
        try:
            connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
            with connection:
                with connection.cursor() as cursor:
                    # Check if email already exists
                    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                    if cursor.fetchone():
                        return (False, "email already exists")

                    # Insert new user
                    cursor.execute("""
                        INSERT INTO users (id ,name, email, password, role_id, distribution_id)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (id, name, email, password, role_id, distribution_id))
                    connection.commit()
                    return (True, "user added successfully")
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return (False, "database error")

    def get_user_by_id(self, user_id):
        try:
            connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                    user = cursor.fetchone()
                    if user:
                        print("User Info:")
                        for key, value in user.items():
                            print(f"{key}: {value}")
                        return (True, user)
                    else:
                        print("User not found.")
                        return (False, "user not found")
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return (False, "database error")

    def get_feeders_by_region(self, region_code):
        """
        Get feeders for a single region
        Args:
            region_code (str): Single region code
        Returns:
            list: List of dictionaries with feeder_name keys
        """
        try:
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT DISTINCT feeder_name FROM feeders WHERE area = %s ORDER BY feeder_name",
                        (region_code,)
                    )
                    return cursor.fetchall()  # => [{ "feeder_name": "Fdr-101" }, …]
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return []
    
    def get_feeders_by_multiple_regions(self, region_codes):
        """
        Get feeders for multiple regions efficiently in a single query
        Args:
            region_codes (list): List of region codes
        Returns:
            dict: {
                'feeders': [{'feeder_name': str, 'area': str}],
                'region_map': {region: [feeders]}
            }
        """
        if not region_codes:
            return {'feeders': [], 'region_map': {}}
            
        try:
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    # Create placeholders for IN clause
                    placeholders = ','.join(['%s'] * len(region_codes))
                    
                    # Single query to get all feeders for all regions
                    query = f"""
                        SELECT DISTINCT feeder_name, area 
                        FROM feeders 
                        WHERE area IN ({placeholders})
                        ORDER BY area, feeder_name
                    """
                    
                    cursor.execute(query, region_codes)
                    results = cursor.fetchall()
                    
                    # Build region mapping
                    region_map = {}
                    all_feeders = []
                    
                    for row in results:
                        feeder_name = row['feeder_name']
                        area = row['area']
                        
                        all_feeders.append(row)
                        
                        if area not in region_map:
                            region_map[area] = []
                        region_map[area].append(feeder_name)
                    
                    return {
                        'feeders': all_feeders,
                        'region_map': region_map
                    }
                    
        except pymysql.MySQLError as e:
            print(f"Database error in get_feeders_by_multiple_regions: {e}")
            return {'feeders': [], 'region_map': {}}

    def get_regions_by_feeder(self, feeder_code):
        """
        Get regions for a specific feeder
        Args:
            feeder_code (str): Feeder code/name
        Returns:
            list: List of dictionaries with area keys
        """
        try:
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT DISTINCT area FROM feeders WHERE feeder_name = %s", (feeder_code,))
                    return cursor.fetchall()
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return []

    def get_all_feeders_and_regions(self):
        """
        Get all feeders and regions available in the system
        Returns:
            dict: {
                'fidders': [feeder_names],  # Note: keeping 'fidders' for frontend compatibility
                'regions': [region_codes]
            }
        """
        try:
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    # Get all distinct feeders
                    cursor.execute("SELECT DISTINCT feeder_name FROM feeders ORDER BY feeder_name")
                    feeders = [row['feeder_name'] for row in cursor.fetchall()]
                    
                    # Get all distinct regions
                    cursor.execute("SELECT DISTINCT area FROM feeders ORDER BY area")
                    regions = [row['area'] for row in cursor.fetchall()]
                    
                    return {
                        "fidders": feeders,  # Keep 'fidders' typo for frontend compatibility
                        "regions": regions
                    }
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return {
                "fidders": [],  # Keep 'fidders' typo for frontend compatibility  
                "regions": []
            }

    def import_power_consumption_new_table(self, csv_input):

        if isinstance(csv_input, str):
            csv_input = open(csv_input, 'r', encoding='utf-8-sig')
        df = pd.read_csv(csv_input)

        df = df.fillna(0)

        required_cols = ['fidder_id', 'date', 'is_off'] + [f'H{i}' for i in range(1, 25)]
        valid_rows = []
        skipped = 0

        for _, row in df.iterrows():
            if any(pd.isnull(row[col]) or row[col] == '' for col in required_cols):
                skipped += 1
                continue

            try:
                fidder_id = row['fidder_id']
                date = row['date']
                is_off = row['is_off']
                distribution_id = 101
                hours = [float(row[f'H{i}']) for i in range(1, 25)]
                domestic = 0
                industrial = 0
                agriculture = 0
                commercial = 0
                lighting = 0
                administrative = 0

                valid_rows.append((
                    distribution_id, fidder_id, date, is_off,
                    *hours,
                    domestic, industrial, agriculture, commercial, lighting, administrative
                ))
            except Exception as e:
                print("Row parse error:", e)
                skipped += 1

        if not valid_rows:
            return {'added': 0, 'updated': 0, 'skipped': skipped}

        insert_sql = (
                "INSERT INTO power_consumption_data (distribution_id, feeder_id, `Date`, is_off, " +
                ", ".join([f"H{i}" for i in range(1, 25)]) +
                ", domestic, industrial, agriculture, commercial, lighting, administrative) VALUES " +
                ", ".join(["(" + ", ".join(["%s"] * 31) + ")"] * len(valid_rows)) +
                " ON DUPLICATE KEY UPDATE " +
                "distribution_id=VALUES(distribution_id), is_off=VALUES(is_off), " +
                ", ".join([f"H{i}=VALUES(H{i})" for i in range(1, 25)]) + ", " +
                "domestic=VALUES(domestic), industrial=VALUES(industrial), agriculture=VALUES(agriculture), " +
                "commercial=VALUES(commercial), lighting=VALUES(lighting), administrative=VALUES(administrative), " +
                "updated_at=CURRENT_TIMESTAMP()"
        )

        flat_params = [item for row in valid_rows for item in row]

        try:
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=DictCursor
            )
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(insert_sql, flat_params)
                conn.commit()
        except Exception as e:
            print("Bulk insert error:", e)
            return False

        return {'added': len(valid_rows), 'updated': 0, 'skipped': skipped}

    def import_power_consumption(self, csv_input):


        counts = {'added': 0, 'updated': 0, 'skipped': 0}
        required_cols = ['کد فیدر', 'تاریخ', 'تعطیلات'] + \
                        [f'H{i}' for i in range(1, 25)] + \
                        ['خانگی', 'صنعتی', 'کشاورزی', 'تجاری', 'روشنایی', 'اداری']

        if isinstance(csv_input, str):
            csvfile = open(csv_input, 'r', encoding='utf-8-sig')
        else:
            csvfile = csv_input

        df = pd.read_csv(csvfile)
        if isinstance(csv_input, str):
            csvfile.close()

        df = df.fillna(0)

        conn = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=DictCursor
        )
        distribution_id = 3

        with conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, feeder_name, area, distribution_id FROM feeders")
                feeders = cursor.fetchall()
                feeder_map = {(f['feeder_name'], f['area']): (f['id'], f['distribution_id']) for f in feeders}

        valid_rows = []
        i = 1
        for _, row in df.iterrows():
            print(i)
            i += 1
            if any(not row.get(col) for col in required_cols):
                counts['skipped'] += 1
                continue

            try:
                feeder_code = row['کد فیدر']


                feeder_id = feeder_code
                date = jdatetime.datetime.strptime(str(row['تاریخ']).replace('/', '-'), '%Y-%m-%d').togregorian()
                is_off = 1 if str(row['تعطیلات']).strip().lower() in ('1', 'true') else 0

                hours = [float(row[f'H{i}']) for i in range(1, 25)]
                domestic = float(row['خانگی'])
                industrial = float(row['صنعتی'])
                agriculture = float(row['کشاورزی'])
                commercial = float(row['تجاری'])
                lighting = float(row['روشنایی'])
                administrative = float(row['اداری'])

                valid_rows.append((
                    distribution_id, feeder_id, date, is_off,
                    *hours,
                    domestic, industrial, agriculture, commercial, lighting, administrative
                ))
            except Exception as e:
                print("Row parse error:", e)
                counts['skipped'] += 1

        if not valid_rows:
            return counts

        insert_sql = (
                "INSERT INTO power_consumption_data (distribution_id, feeder_id, `Date`, is_off, " +
                ", ".join([f"H{i}" for i in range(1, 25)]) +
                ", domestic, industrial, agriculture, commercial, lighting, administrative) VALUES " +
                ", ".join(["(" + ", ".join(["%s"] * 31) + ")"] * len(valid_rows)) +
                " ON DUPLICATE KEY UPDATE " +
                "distribution_id=VALUES(distribution_id), is_off=VALUES(is_off), " +
                ", ".join([f"H{i}=VALUES(H{i})" for i in range(1, 25)]) + ", " +
                "domestic=VALUES(domestic), industrial=VALUES(industrial), agriculture=VALUES(agriculture), " +
                "commercial=VALUES(commercial), lighting=VALUES(lighting), administrative=VALUES(administrative), " +
                "updated_at=CURRENT_TIMESTAMP()"
        )

        flat_params = [item for row in valid_rows for item in row]

        try:
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=DictCursor
            )
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(insert_sql, flat_params)
                conn.commit()
        except Exception as e:
            print("Bulk insert error:", e)
            return False

        counts['added'] = len(valid_rows)
        return counts


    def update_record(
        self, table: str, conditions: dict, new_values: dict
    ) -> None:
        """
        UPDATE `table` SET new_values WHERE conditions.
        Only non-None values in new_values are applied.
        """
        conn = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=DictCursor
        )
        try:
            with conn:
                with conn.cursor() as cursor:
                    filtered = {k: v for k, v in new_values.items() if v is not None}
                    if not filtered:
                        return  # Nothing to update

                    set_clause = ", ".join(f"`{k}`=%s" for k in filtered.keys())
                    where_clause = " AND ".join(f"`{k}`=%s" for k in conditions.keys())
                    sql = f"UPDATE `{table}` SET {set_clause} WHERE {where_clause};"
                    params = tuple(filtered.values()) + tuple(conditions.values())
                    cursor.execute(sql, params)
                    conn.commit()
                    print()
                    return "password changed"
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return False
        except Exception as e:
            print("Import error:", e)
            return False

    def fetch_data(self, table_name, conditions: dict = None):
        conn = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=DictCursor
        )
        try:
            with conn:
                with conn.cursor() as cursor:
                    if conditions:
                        where_clauses = " AND ".join(f"'{k}'=%s" for k in conditions.keys())
                        sql = f"SELECT * FROM {table_name} WHERE {where_clauses};"
                        params = tuple(conditions.values())
                    else:
                        sql = f"SELECT * FROM '{table_name}';"
                        params = ()

                    cursor.execute(sql, params)

                    rows = cursor.fetchall()

            # check if there are some result or not
            if not rows:
                text = f"No records found in table '{table_name}'."
                print(text)
                return False
            else:
                print(rows)
                return rows


        except pymysql.MySQLError as e:

            print("Database error:", e)

            return False

        except Exception as e:

            print("Import error:", e)

            return False


    def execute_sql(self, query: str):
        conn = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=DictCursor
        )
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    result = cursor.fetchall()
                    conn.commit()
            print("query executed successfully")
            return result
        except pymysql.MySQLError as e:
            print("Database error:", e)
            return False
        except Exception as e:
            print("Import error:", e)
            return False

    def import_feeders_from_csv(self, csv_file_path):
        """
        Imports feeder_name and area from a CSV file and inserts into the feeders table.
        Assumes distribution_id is constant (3), and specification_name is NULL.
        CSV columns: feeder_id, area_code
        """
        try:
            # Read CSV
            df = pd.read_csv(csv_file_path)
            df.columns = df.columns.str.strip()  # Remove leading/trailing whitespaces

            # Establish DB connection
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    i = 1
                    for _, row in df.iterrows():
                        print(i)
                        i +=1
                        feeder_name = str(row["feeder_id"]).strip()
                        area_code = int(row["area_code"])

                        # Insert into feeders
                        cursor.execute("""
                            INSERT INTO feeders (feeder_name, specification_name, area, distribution_id)
                            VALUES (%s, %s, %s, %s)
                        """, (feeder_name, None, area_code, 3))

                    connection.commit()
            print("✅ Feeders imported successfully.")
            return True

        except Exception as e:
            print(f"❌ Error in import_feeders_from_csv: {e}")
            return False


# db = Database()
#
# print(db.execute_sql("ALTER TABLE power_consumption_data ADD UNIQUE KEY unique_feeder_date (feeder_id, `Date`);"))
# email="sadjad@gmail.com"
# password="cBgB0fZ90#$0Kp"
# ALTER TABLE `power_consumption_data`
# #   MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=344750;
# db = Database()
# result = db.add_user(id=101,name="flour-company",email="flour.company@gmail.com",password="kZGbuMOxXBQtbua",distribution_id=101)
# print(result)
# print(db.execute_sql("ALTER TABLE new_table CHANGE COLUMN `Date` `date` DATE DEFAULT NULL;"))
#
# csv_file = open("./test.csv",encoding="utf-8-sig")
# print(db.import_power_consumption_new_table(csv_file))
#
# result = db.execute_sql("""SELECT *
# FROM new_table
# LIMIT 5;
# """)

# print(result)

# [{'id': 172380, 'distribution_id': 3, 'feeder_id': 1, 'Date': datetime.date(2022, 3, 21), 'H1': 2.576, 'H2': 2.312, 'H3': 2.119, 'H4': 2.018, 'H5': 1.954, 'H6': 1.877, 'H7': 1.863, 'H8': 1.901, 'H9': 2.016, 'H10': 2.162, 'H11': 2.314, 'H12': 2.372, 'H13': 2.407, 'H14': 2.373, 'H15': 2.305, 'H16': 2.255, 'H17': 2.287, 'H18': 2.489, 'H19': 2.816, 'H20': 2.877, 'H21': 2.883, 'H22': 2.9, 'H23': 2.866, 'H24': 2.742, 'is_off': 0, 'total_consumption': 56.684, 'domestic': 0.4, 'industrial': 0.25, 'agriculture': 0.1, 'commercial': 0.12, 'lighting': 0.1, 'administrative': 0.03, 'created_at': datetime.datetime(2025, 5, 11, 11, 35, 57), 'updated_at': datetime.datetime(2025, 5, 11, 11, 35, 57)}, {'id': 172381, 'distribution_id': 3, 'feeder_id': 2, 'Date': datetime.date(2022, 3, 21), 'H1': 2.736, 'H2': 2.429, 'H3': 2.215, 'H4': 2.094, 'H5': 2.054, 'H6': 1.931, 'H7': 1.843, 'H8': 1.874, 'H9': 1.981, 'H10': 2.161, 'H11': 2.323, 'H12': 2.383, 'H13': 2.37, 'H14': 2.349, 'H15': 2.327, 'H16': 2.274, 'H17': 2.327, 'H18': 2.513, 'H19': 2.842, 'H20': 2.909, 'H21': 2.957, 'H22': 3.004, 'H23': 2.98, 'H24': 2.898, 'is_off': 0, 'total_consumption': 57.774, 'domestic': 0.4, 'industrial': 0.25, 'agriculture': 0.1, 'commercial': 0.12, 'lighting': 0.1, 'administrative': 0.03, 'created_at': datetime.datetime(2025, 5, 11, 11, 35, 57), 'updated_at': datetime.datetime(2025, 5, 11, 11, 35, 57)}, {'id': 172382, 'distribution_id': 3, 'feeder_id': 3, 'Date': datetime.date(2022, 3, 21), 'H1': 2.895, 'H2': 2.604, 'H3': 2.38, 'H4': 2.254, 'H5': 2.188, 'H6': 2.092, 'H7': 2.025, 'H8': 2.042, 'H9': 2.169, 'H10': 2.335, 'H11': 2.487, 'H12': 2.55, 'H13': 2.578, 'H14': 2.566, 'H15': 2.556, 'H16': 2.513, 'H17': 2.54, 'H18': 2.748, 'H19': 3.076, 'H20': 3.153, 'H21': 3.182, 'H22': 3.193, 'H23': 3.165, 'H24': 3.026, 'is_off': 0, 'total_consumption': 62.317, 'domestic': 0.4, 'industrial': 0.25, 'agriculture': 0.1, 'commercial': 0.12, 'lighting': 0.1, 'administrative': 0.03, 'created_at': datetime.datetime(2025, 5, 11, 11, 35, 57), 'updated_at': datetime.datetime(2025, 5, 11, 11, 35, 57)}, {'id': 172383, 'distribution_id': 3, 'feeder_id': 4, 'Date': datetime.date(2022, 3, 21), 'H1': 2.277, 'H2': 2.108, 'H3': 1.945, 'H4': 1.882, 'H5': 1.857, 'H6': 1.675, 'H7': 1.511, 'H8': 1.532, 'H9': 1.646, 'H10': 1.909, 'H11': 2.172, 'H12': 2.293, 'H13': 2.379, 'H14': 2.415, 'H15': 2.436, 'H16': 2.475, 'H17': 2.565, 'H18': 2.907, 'H19': 3.391, 'H20': 3.389, 'H21': 3.415, 'H22': 3.428, 'H23': 3.326, 'H24': 3.048, 'is_off': 0, 'total_consumption': 57.981, 'domestic': 0.4, 'industrial': 0.25, 'agriculture': 0.1, 'commercial': 0.12, 'lighting': 0.1, 'administrative': 0.03, 'created_at': datetime.datetime(2025, 5, 11, 11, 35, 57), 'updated_at': datetime.datetime(2025, 5, 11, 11, 35, 57)}, {'id': 172384, 'distribution_id': 3, 'feeder_id': 5, 'Date': datetime.date(2022, 3, 21), 'H1': 1.232, 'H2': 1.092, 'H3': 0.984, 'H4': 0.886, 'H5': 0.841, 'H6': 0.843, 'H7': 0.829, 'H8': 0.842, 'H9': 0.926, 'H10': 1.009, 'H11': 1.092, 'H12': 1.117, 'H13': 1.107, 'H14': 1.102, 'H15': 1.058, 'H16': 1.064, 'H17': 1.098, 'H18': 1.17, 'H19': 1.324, 'H20': 1.342, 'H21': 1.33, 'H22': 1.332, 'H23': 1.303, 'H24': 1.269, 'is_off': 0, 'total_consumption': 26.192, 'domestic': 0.4, 'industrial': 0.25, 'agriculture': 0.1, 'commercial': 0.12, 'lighting': 0.1, 'administrative': 0.03, 'created_at': datetime.datetime(2025, 5, 11, 11, 35, 57), 'updated_at': datetime.datetime(2025, 5, 11, 11, 35, 57)}]
# [{'id': 2, 'distribution_id': 101, 'feeder_id': 1, 'date': datetime.date(2024, 3, 20), 'H1': 31.0, 'H2': 31.2, 'H3': 31.8, 'H4': 31.8, 'H5': 32.0, 'H6': 32.2, 'H7': 32.0, 'H8': 27.2, 'H9': 26.4, 'H10': 26.6, 'H11': 25.4, 'H12': 26.0, 'H13': 26.2, 'H14': 26.0, 'H15': 26.0, 'H16': 26.0, 'H17': 25.4, 'H18': 25.4, 'H19': 30.8, 'H20': 31.8, 'H21': 32.0, 'H22': 33.4, 'H23': 32.8, 'H24': 33.4, 'is_off': 1, 'total_consumption': 702.8, 'domestic': 0.0, 'industrial': 0.0, 'agriculture': 0.0, 'commercial': 0.0, 'lighting': 0.0, 'administrative': 0.0, 'created_at': datetime.datetime(2025, 7, 6, 13, 42, 34), 'updated_at': datetime.datetime(2025, 7, 6, 13, 47, 11)}, {'id': 3, 'distribution_id': 101, 'feeder_id': 1, 'date': datetime.date(2024, 3, 23), 'H1': 440.6, 'H2': 484.2, 'H3': 478.0, 'H4': 426.0, 'H5': 483.2, 'H6': 438.0, 'H7': 429.0, 'H8': 433.6, 'H9': 465.0, 'H10': 506.6, 'H11': 443.6, 'H12': 420.6, 'H13': 434.2, 'H14': 443.0, 'H15': 486.0, 'H16': 482.8, 'H17': 472.8, 'H18': 475.2, 'H19': 446.2, 'H20': 421.4, 'H21': 286.8, 'H22': 438.6, 'H23': 461.2, 'H24': 476.4, 'is_off': 1, 'total_consumption': 10773.0, 'domestic': 0.0, 'industrial': 0.0, 'agriculture': 0.0, 'commercial': 0.0, 'lighting': 0.0, 'administrative': 0.0, 'created_at': datetime.datetime(2025, 7, 6, 13, 42, 34), 'updated_at': datetime.datetime(2025, 7, 6, 13, 47, 11)}, {'id': 4, 'distribution_id': 101, 'feeder_id': 1, 'date': datetime.date(2024, 3, 29), 'H1': 448.8, 'H2': 492.0, 'H3': 496.4, 'H4': 518.4, 'H5': 505.0, 'H6': 513.4, 'H7': 512.4, 'H8': 486.6, 'H9': 568.2, 'H10': 542.6, 'H11': 533.4, 'H12': 191.6, 'H13': 168.8, 'H14': 480.8, 'H15': 532.6, 'H16': 528.6, 'H17': 478.4, 'H18': 479.2, 'H19': 474.6, 'H20': 478.6, 'H21': 442.8, 'H22': 444.2, 'H23': 486.6, 'H24': 474.4, 'is_off': 1, 'total_consumption': 11278.4, 'domestic': 0.0, 'industrial': 0.0, 'agriculture': 0.0, 'commercial': 0.0, 'lighting': 0.0, 'administrative': 0.0, 'created_at': datetime.datetime(2025, 7, 6, 13, 42, 34), 'updated_at': datetime.datetime(2025, 7, 6, 13, 47, 12)}, {'id': 5, 'distribution_id': 101, 'feeder_id': 1, 'date': datetime.date(2024, 3, 31), 'H1': 447.4, 'H2': 443.4, 'H3': 409.4, 'H4': 422.6, 'H5': 421.8, 'H6': 416.8, 'H7': 412.8, 'H8': 473.6, 'H9': 464.2, 'H10': 437.0, 'H11': 478.0, 'H12': 471.6, 'H13': 84.6, 'H14': 52.2, 'H15': 97.2, 'H16': 25.8, 'H17': 25.0, 'H18': 24.4, 'H19': 27.6, 'H20': 30.8, 'H21': 31.2, 'H22': 33.0, 'H23': 33.2, 'H24': 33.6, 'is_off': 1, 'total_consumption': 5797.2, 'domestic': 0.0, 'industrial': 0.0, 'agriculture': 0.0, 'commercial': 0.0, 'lighting': 0.0, 'administrative': 0.0, 'created_at': datetime.datetime(2025, 7, 6, 13, 42, 34), 'updated_at': datetime.datetime(2025, 7, 6, 13, 47, 12)}, {'id': 6, 'distribution_id': 101, 'feeder_id': 1, 'date': datetime.date(2024, 4, 1), 'H1': 33.8, 'H2': 34.0, 'H3': 33.8, 'H4': 34.4, 'H5': 33.8, 'H6': 34.2, 'H7': 26.6, 'H8': 25.4, 'H9': 25.2, 'H10': 25.2, 'H11': 24.6, 'H12': 24.6, 'H13': 25.0, 'H14': 25.0, 'H15': 24.4, 'H16': 24.8, 'H17': 24.6, 'H18': 24.4, 'H19': 30.6, 'H20': 31.2, 'H21': 31.8, 'H22': 143.8, 'H23': 143.2, 'H24': 154.2, 'is_off': 1, 'total_consumption': 1038.6, 'domestic': 0.0, 'industrial': 0.0, 'agriculture': 0.0, 'commercial': 0.0, 'lighting': 0.0, 'administrative': 0.0, 'created_at': datetime.datetime(2025, 7, 6, 13, 42, 34), 'updated_at': datetime.datetime(2025, 7, 6, 13, 47, 12)}]

# query = "ALTER TABLE power_consumption_data MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;"
# db.execute_sql(query=query)
# filter = {
#     "id":33
# }
# new_values = {
#     "email":"sadjad@gmail.com"
# }
# print(db.update_record("users",filter,new_values))

# print(db.add_user(id=34 ,name="techie", email="techie@gmail.com", password="123456789"))
# db.get_user_by_id(34)

# print(db.get_all_feeders_and_regions())
# print(db.get_feeders_by_region(16))
# print(db.get_regions_by_feeder(20))


# print(db.execute_sql("SELECT * FROM power_consumption_data WHERE id=172380;"))

# check input
# with open("Sample-public.csv", mode="r", encoding="utf-8-sig") as csvfile:
#     result = db.import_power_consumption(csvfile)
#     print(result)


# condition = {
#     "id": 344750,
# }
# print(db.fetch_data("power_consumption_data",condition))



# distribution_id = 101 -> private

# db = Database()
#
# query = """INSERT INTO feeders (
#   id, feeder_name, specification_name, area, distribution_id
# ) VALUES (
#   8000, '1', 'flour company', 1, 101
# );
# """
#
# result = db.execute_sql(query)
# print(result)
# with open("1399.csv", mode="r", encoding="utf-8-sig") as csvfile:
#     result = db.import_power_consumption(csvfile)
#     print(1399)
#     print(result)

#
# with open("1400.csv", mode="r", encoding="utf-8-sig") as csvfile:
#     result = db.import_power_consumption(csvfile)
#     print(1400)
#     print(result)
#
# with open("1402.csv", mode="r", encoding="utf-8-sig") as csvfile:
#     result = db.import_power_consumption(csvfile)
#     print(1402)
#     print(result)
#
#
# with open("1403.csv", mode="r", encoding="utf-8-sig") as csvfile:
#     result = db.import_power_consumption(csvfile)
#     print(1403)
#     print(result)


#
# db = Database()
# with open("./1399.csv", 'r', encoding='utf-8-sig') as csv_file:
#     print(db.import_power_consumption(csv_file))


# print(db.execute_sql("INSERT INTO feeders (feeder_name, specification_name, area, distribution_id) VALUES ('1', NULL, 1, 101);"))

# print(db.import_feeders_from_csv("./feeder_area_code_mapping.csv"))


# db = Database()
# result = db.add_user(id=201,name="public-company",email="sadjad.region@gmail.com",password="6#gT70R2q4",distribution_id=3)
# print(result)
# result = db.add_user(id=202,name="public-company",email="sadjad.fidder@gmail.com",password="a35@nC-X0a9",distribution_id=3)
# print(result)


# print(db.is_user("sadjad@gmail.com","cBgB0fZ90#$0Kp"))

# print(db.execute_sql("select * from users where email='sadjad@gmail.com'"))
# result = db.update_record("users", {"email":"sadjad@gmail.com"}, {"distribution_id":3})
# print(result)