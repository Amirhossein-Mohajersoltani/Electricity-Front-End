import jdatetime


def get_years_between(start_date_str, end_date_str):
    start_date = jdatetime.datetime.strptime(start_date_str.replace("/", "-"), "%Y-%m-%d")
    end_date = jdatetime.datetime.strptime(end_date_str.replace("/", "-"), "%Y-%m-%d")
    start_year = start_date.year
    end_year = end_date.year
    return [int(year) for year in range(start_year, end_year + 1)]
