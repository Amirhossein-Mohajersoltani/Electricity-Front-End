import io

import datetime
from functools import wraps

from flask import Flask, request, jsonify, session, send_from_directory
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf
from flask_cors import CORS
import os
import requests


from database import Database
from config import Config
from utils import get_years_between, admin_request
from server_log import *
import company_info
# pytest: disable

# Instruction for adding new user and data
# 1- add fidders
# 2- add powercunsumption_data
# 3- users
# update private
PRIVATE = company_info.private_companies
# users = [
#     {
#
#         "email": "sadjad.region@gmail.com",
#         "company_type": "public",
#         "region_available": [1]
#     },
#     {
#         "id":101,
# "sadjad.fidder@gmail.com"
#         "company_type": "private"
#     }
# ]


def api_response(status="success", message="", data=None, code=200):
    res = {
        "status": status,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(res), code


# =================== API Logging & Auth Decorator ===================
def api_log_and_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"=== Calling {func.__name__} ===")
        log_session_state("BEFORE")

        # Check for authentication if it's not a login or CSRF route
        if request.path not in ['/api/login', '/api/csrf-token', '/api/health', '/api/check-analysis-status']:
            if 'user_email' not in session:
                logger.warning(f"Unauthorized access to {request.path}")
                return api_response(status="error", message="کاربر احراز هویت نشده - لطفاً دوباره لاگین کنید", code=401)

        # Log request body if present
        try:
            if request.get_json():
                logger.info(f"Request JSON data: {request.get_json()}")
        except Exception:
            pass

        result = func(*args, **kwargs)

        log_session_state("AFTER")
        logger.info(f"=== End {func.__name__} ===")
        return result

    return wrapper


app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
app.secret_key = Config.SECRET_KEY

app.config.update(
    SECRET_KEY=Config.SECRET_KEY,
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=False,
    SESSION_COOKIE_SAMESITE=None,
    SESSION_PERMANENT=False,
    PERMANENT_SESSION_LIFETIME=3600,
    SESSION_COOKIE_NAME='electricity_session',
    SESSION_COOKIE_PATH='/',
    SESSION_COOKIE_DOMAIN=None,
    SESSION_REFRESH_EACH_REQUEST=True,
    SESSION_USE_SIGNER=True,
    SESSION_KEY_PREFIX='electricity:'
)

CORS(app,
     supports_credentials=True,
     origins=Config.get_cors_origins(),
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control',
                    'X-CSRFToken', 'Cookie'],
     methods=['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
     expose_headers=['X-Debug-Session', 'X-Debug-User', 'Set-Cookie'],
     vary_header=False
     )


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'preflight'})
        origin = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS,PUT,DELETE'
        response.headers[
            'Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,X-CSRFToken'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response


@app.before_request
def before_request_logging():
    if request.method == "OPTIONS":
        return
    log_request_details()


# =================== Centralized API Call Helper ===================
def api_proxy_request(endpoint, payload):
    """
    Handles POST requests to the Analysis API, including error handling.
    """
    full_url = f"{Config.ANALYSIS_API_BASE}/{endpoint}"
    try:
        logger.info(f"Calling Analysis API endpoint: {full_url}")
        logger.info(f"Request payload: {payload}")

        response = requests.post(full_url, json=payload, timeout=120)

        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response content: {response.text}")

        if response.status_code == 200:
            return response.json(), 200
        elif response.status_code == 422:
            return {"error": "داده‌های ورودی نامعتبر هستند."}, 400
        elif response.status_code == 404:
            return {"error": "سرویس تحلیل مورد نظر یافت نشد."}, 404
        else:
            return {"error": f"خطای غیرمنتظره از سرور تحلیل (کد {response.status_code})"}, 500

    except requests.exceptions.Timeout:
        logger.error(f"Analysis API timeout for {endpoint}")
        return {"error": "زمان اتصال به سرور تحلیل به پایان رسید."}, 504
    except requests.exceptions.ConnectionError:
        logger.error(f"Analysis API connection failed for {endpoint}")
        return {"error": "امکان اتصال به سرور تحلیل وجود ندارد."}, 503
    except Exception as e:
        logger.error(f"Unexpected error calling Analysis API: {e}")
        return {"error": f"خطای غیرمنتظره: {str(e)}"}, 500


# =================== API Routes ===================
@app.route('/api/health', methods=['GET', 'POST'])
def health_check():
    return api_response(data={"status": "healthy", "timestamp": datetime.datetime.now().isoformat()})


@app.route("/api/csrf-token", methods=["POST"])
def get_csrf_token():
    token = generate_csrf()
    return api_response(data={"token": token})


@app.route('/api/test-session', methods=['POST'])
@api_log_and_auth
def run_test_session():
    session['test_key'] = 'test_value'
    session['test_timestamp'] = datetime.datetime.now().isoformat()
    return api_response(data={"session_contents": dict(session), "test_message": "Session test completed"})


@app.route('/api/login', methods=['POST'])
@api_log_and_auth
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")


    is_user = db.is_user(email, password)

    if is_user[0]:
        session.permanent = True
        session['user_email'] = email
        session['login_timestamp'] = datetime.datetime.now().isoformat()
        session['session_token'] = f"token_{email}_{datetime.datetime.now().timestamp()}"
        session['company'] = "private" if is_user[1] in PRIVATE else "public"
        if session.get("user_email") == "sadjad.admin@gmail.com":
            session['company'] = "admin"
        session['company_id'] = is_user[1]

        for company in company_info.COMPANY_INFO:
            if company["email"] == email:
                company_name = company["company_name"]
                session['company_name'] = company_name
                break

        print(session)

        print(is_user[1])
        print(session['company_id'])
        session.modified = True

        return api_response(message="Login successful", data={
            "authenticated": True, "email": email, "company": session['company']
        })

    return api_response(status="error", message=is_user[1], code=401)


@app.route('/api/logout', methods=['POST'])
@api_log_and_auth
def logout():
    session.clear()
    return api_response(message="Logout successful")


@app.route('/api/dashboard', methods=['POST'])
@api_log_and_auth
def dashboard():
    user_email = session["user_email"]
    return api_response(message="Welcome!", data={"email": user_email})


@app.route('/api/check-auth', methods=['POST'])
@api_log_and_auth
def check_auth():
    user_email = session["user_email"]
    company_type = session.get('company', 'public')
    return api_response(data={
        "authenticated": True,
        "email": user_email,
        "company": company_type
    })


@app.route('/api/fidder-analysis', methods=['POST'])
@api_log_and_auth
def get_fidder_analysis():
    data = request.get_json()
    fidder_codes = data.get("fidder_code", [1])
    start_date = data.get("start_date").replace("/", "-")
    end_date = data.get("end_date").replace("/", "-")
    region_codes = data.get("region_code", [1])



    # For admin:
    if session.get("user_email") == "sadjad.admin@gmail.com":
        company_names = data.get("company_names")
        company_ids_names = {int(company["distribution_id"]):company["company_name"] for company in company_info.COMPANY_INFO if company["company_name"] in company_names}
        years = get_years_between(start_date, end_date)
        fidder_codes = [1]
        region_codes = [1]

        admin_response = {}
        for company_id,company_name in company_ids_names.items():
            result = admin_request(start_date,end_date,years,region_codes,fidder_codes,[company_id],Config.ANALYSIS_API_BASE)
            admin_response[company_name] = result
        return api_response(data=admin_response)

    if fidder_codes[0] == "private_company_feeder":
        fidder_codes = [1]
    if region_codes[0] == "private_company_region":
        region_codes = [1]


    if not start_date or not end_date:
        return api_response(status="error", message="لطفاً بازه تاریخی را مشخص کنید", code=400)

    try:
        region_codes_int = [int(r) for r in (region_codes if isinstance(region_codes, list) else [region_codes]) if r]
        fidder_codes_int = [int(f) for f in (fidder_codes if isinstance(fidder_codes, list) else [fidder_codes]) if f]
    except ValueError as e:
        return api_response(status="error", message="کدهای منطقه یا فیدر نامعتبر هستند", code=400)

    company_id = [session['company_id']]
    years = get_years_between(start_date, end_date)

    analysis_data = {
        "company_id": company_id,
        "start_date": start_date.replace("/", "-"),
        "end_date": end_date.replace("/", "-"),
        "region_code": region_codes_int,
        "fidder_code": fidder_codes_int
    }
    long_term_data = {
        "company_id": company_id,
        "year": years,
        "region_code": region_codes_int,
        "fidder_code": fidder_codes_int
    }

    results = {}
    endpoints_to_call = {
        "daily_peak": ("daily-peak", analysis_data),
        "weekly_peak": ("weekly-peak", analysis_data),
        "Load_continuity": ("Load-continuity", analysis_data),
        "long_term": ("long-term", long_term_data),
        "daily_profil_max": ("daily-profile", {**analysis_data, "method": "max"}),
        "daily_profil_mean": ("daily-profile", {**analysis_data, "method": "mean"})
    }
    print(analysis_data)
    print(long_term_data)


    for key, (endpoint, payload) in endpoints_to_call.items():
        response_data, status_code = api_proxy_request(endpoint, payload)
        if status_code != 200:
            logger.error(f"Error for {key}: {response_data.get('error')}")
            # Consider returning an error here or just logging it
        results[key] = response_data

    return api_response(data=results)


@app.route('/api/compare-energetic', methods=['POST'])
@api_log_and_auth
def get_energy_comparison():
    data = request.get_json()
    print(f"data {data}")
    fidder_codes = data.get("fidder_code", [1])
    region_codes = data.get("region_code", [1])
    start_date = data.get("start_date").replace("/", "-")
    end_date = data.get("end_date").replace("/", "-")
    company_id = [session.get("company_id")]
    period = data.get("period", "year")
    costume_period = None
    if period == "weekly":
        period = "week"
    elif period == "monthly":
        period = "month"
    elif period == "yearly":
        period = "year"
    else:
        period = 'custom'
        costume_period = int(data.get("costume_period"))

    if session.get("user_email") == "sadjad.admin@gmail.com":
        company_names = data.get("company_names")
        company_ids_names = {int(company["distribution_id"]): company["company_name"] for company in
                             company_info.COMPANY_INFO if company["company_name"] in company_names}
        region_codes = [1]
        fidder_codes = [1]

        datas = {}
        for company_id,company_name in company_ids_names.items():
            params = {
                "start_date": start_date.replace("/", "-"),
                "end_date": end_date.replace("/", "-"),
                "region_code": region_codes,
                "fidder_code": fidder_codes,
                "company_id": [company_id],
                "period": period,
                "costume_period": costume_period
            }
            response = requests.post(f"{Config.ANALYSIS_API_BASE}/compare-energetic", json=params)
            datas[company_name] = response.json()

        return api_response(data=datas)



    if fidder_codes[0] == "private_company_feeder":
        fidder_codes = [1]
    if region_codes[0] == "private_company_region":
        region_codes = [1]



    try:
        region_codes_int = [int(r) for r in (region_codes if isinstance(region_codes, list) else [region_codes]) if r]
        fidder_codes_int = [int(f) for f in (fidder_codes if isinstance(fidder_codes, list) else [fidder_codes]) if f]
    except ValueError:
        return api_response(status="error", message="کدهای منطقه، فیدر یا سال نامعتبر هستند", code=400)


    payload = {
        "company_id": company_id,
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes_int,
        "fidder_code": fidder_codes_int,
        "period": period,
        "costume_period": costume_period,
    }

    response_data, status_code = api_proxy_request("compare-energetic", payload)
    if status_code == 200:
        return api_response(data={"energy_comparison": response_data})
    else:
        return api_response(status="error", message=response_data.get("error"), code=status_code)


@app.route('/api/consumption-distribution', methods=['POST'])
@api_log_and_auth
def get_consumption_distribution():
    data = request.get_json()
    fidder_codes = data.get("fidder_code", [1])
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    region_codes = data.get("region_code", [1])

    if not start_date or not end_date:
        return api_response(status="error", message="لطفاً بازه تاریخی را مشخص کنید", code=400)

    if fidder_codes[0] == "private_company_feeder":
        fidder_codes = [1]
    if region_codes[0] == "private_company_region":
        region_codes = [1]


    try:
        region_codes_int = [int(r) for r in (region_codes if isinstance(region_codes, list) else [region_codes]) if r]
        fidder_codes_int = [int(f) for f in (fidder_codes if isinstance(fidder_codes, list) else [fidder_codes]) if f]
    except ValueError:
        return api_response(status="error", message="کدهای منطقه یا فیدر نامعتبر هستند", code=400)

    company_id = [session['company_id']]

    payload = {
        "start_date": start_date.replace("/", "-"),
        "end_date": end_date.replace("/", "-"),
        "region_code": region_codes_int,
        "fidder_code": fidder_codes_int,
        "company_id": company_id,
    }

    response_data, status_code = api_proxy_request("consumption-distribution", payload)
    if status_code == 200:
        return api_response(data={"consumption_distribution": response_data})
    else:
        return api_response(status="error", message=response_data.get("error"), code=status_code)


@app.route('/api/consumption-limitation', methods=['POST'])
@api_log_and_auth
def consumption_limitation():
    data = request.get_json()
    fidder_codes = data.get("fidder_code", [1])
    region_codes = data.get("region_code", [1])

    if session.get("user_email") == "sadjad.admin@gmail.com":
        company_names = data.get("company_names")
        company_ids_names = {int(company["distribution_id"]): company["company_name"] for company in
                             company_info.COMPANY_INFO if company["company_name"] in company_names}

        datas = {}
        for company_id,company_name in company_ids_names.items():
            params = {
                "company_id": [company_id],
                "fidder_code": [1],
                "region_code": [1],
                "No_limitation_start_date": data.get("no_limitation_start_date", "").replace("/", "-"),
                "No_limitation_end_date": data.get("no_limitation_end_date", "").replace("/", "-"),
                "limitation_start_date": data.get("limitation_start_date", "").replace("/", "-"),
                "limitation_end_date": data.get("limitation_end_date", "").replace("/", "-"),
            }
            response = requests.post(f"{Config.ANALYSIS_API_BASE}/consumption-limitation", json=params)
            datas[company_name] = response.json()
        print(datas)
        return api_response(data=datas)


    if fidder_codes[0] == "private_company_feeder":
        fidder_codes = [1]
    if region_codes[0] == "private_company_region":
        region_codes = [1]

    try:
        fidder_codes_int = [int(f) for f in (fidder_codes if isinstance(fidder_codes, list) else [fidder_codes]) if f]
        region_codes_int = [int(r) for r in (region_codes if isinstance(region_codes, list) else [region_codes]) if r]
    except ValueError:
        return api_response(status="error", message="کدهای منطقه یا فیدر نامعتبر هستند", code=400)

    company_id = [session['company_id']]

    payload = {
        "company_id": company_id,
        "fidder_code": fidder_codes_int,
        "region_code": region_codes_int,
        "No_limitation_start_date": data.get("no_limitation_start_date", "").replace("/", "-"),
        "No_limitation_end_date": data.get("no_limitation_end_date", "").replace("/", "-"),
        "limitation_start_date": data.get("limitation_start_date", "").replace("/", "-"),
        "limitation_end_date": data.get("limitation_end_date", "").replace("/", "-"),
    }

    response_data, status_code = api_proxy_request("consumption-limitation", payload)
    if status_code == 200:
        return api_response(data={"consumption_limitation": response_data})
    else:
        return api_response(status="error", message=response_data.get("error"), code=status_code)


@app.route('/api/get-fidder-region', methods=['POST'])
@api_log_and_auth
def get_fidder_region():
    """
    Enhanced endpoint to handle region/feeder relationships with support for:
    1. Getting all regions and feeders (empty request)
    2. Getting feeders for a single region
    3. Getting feeders for multiple regions (array support)
    4. Getting regions for a single feeder
    """






    data = request.get_json()




    # CASE 1: Handle region_code (single or multiple regions)
    if data.get("region_code"):
        region_codes = data["region_code"]

        if session["user_email"] == "sadjad.region@gmail.com":
            region_codes = [1]

        if session["user_email"] == "sadjad.fidder@gmail.com":
            return api_response(status="success",
                                data={
                                    "region_codes": [1],
                                    "fidders": [1],
                                    "total_fidders": 1,

                                    "requested_regions": [1],
                                    "processing_summary": f"Processed {[1]} regions, found feeders in {[1]} regions"
                                }
                                )

        if isinstance(region_codes, list):
            all_feeders = []
            region_fidder_map = {}
            successful_regions = []

            for region in region_codes:
                try:
                    feeders_raw = db.get_feeders_by_region(region)
                    feeders = sorted(
                        [feeder['feeder_name'] for feeder in feeders_raw],
                        key=lambda x: int(x.split("-")[-1])
                    ) if feeders_raw else []

                    if feeders:
                        all_feeders.extend(feeders)
                        region_fidder_map[region] = feeders
                        successful_regions.append(region)
                except Exception as e:
                    logger.error(f"Error processing region {region}: {e}")
                    continue

            unique_feeders = list(dict.fromkeys(all_feeders))

            result = api_response(status="success",
                                  data={
                                      "region_codes": successful_regions,
                                      "fidders": unique_feeders,
                                      "total_fidders": len(unique_feeders),
                                      "region_fidder_map": region_fidder_map,
                                      "requested_regions": region_codes,
                                      "processing_summary": f"Processed {len(region_codes)} regions, found feeders in {len(successful_regions)} regions"
                                  }
                                  )

        else:  # Single region support
            feeders_raw = db.get_feeders_by_region(region_codes)
            feeders = sorted(
                [feeder['feeder_name'] for feeder in feeders_raw],
                key=lambda x: int(x.split("-")[-1])
            ) if feeders_raw else []

            result = api_response(status="success",
                                  data={
                                      "region_code": region_codes,
                                      "fidders": feeders,
                                      "total_fidders": len(feeders)
                                  }
                                  )

    # CASE 2: Handle fidder_code (get regions for a specific feeder)
    elif data.get("fidder_code"):
        feeder_code = data["fidder_code"]
        regions_raw = db.get_regions_by_feeder(feeder_code)
        regions = [region['area'] for region in regions_raw] if regions_raw else []

        result = api_response(status="success",
                              data={
                                  "fidder_code": feeder_code,
                                  "regions": regions,
                                  "total_regions": len(regions)
                              }
                              )

    # CASE 3: Get all regions and feeders (initial data load)
    else:
        try:
            all_data = db.get_all_feeders_and_regions()

            if session["user_email"] == "sadjad.region@gmail.com":
                all_data = {
                    'fidders': [
                        '1',"32","39","88","137","142","149","153","166","179","185","204","247","248","264","277",
                        "279","287","289","291","293","301","302","318","331","353","359","378","380","400","404","429",
                        "431","441","443","464","468","477","479","493","499"
                    ],
                    'regions': [
                        1,
                    ]
                }
            elif session["user_email"] == "sadjad.fidder@gmail.com":
                all_data = {
                    'fidders': [
                        '1',"32"
                    ],
                    'regions': [
                        1,
                    ]
                }
            result = api_response(status="success", data=all_data)

        except Exception as e:
            logger.error(f"Error getting all regions and feeders: {e}")
            result = api_response(status="error",
                                  message="خطا در دریافت لیست مناطق و فیدرها",
                                  code=500)

    return result


@app.route('/api/get-private-companies', methods=['POST'])
@api_log_and_auth
def get_private_companies():
    return api_response(data={"company_names": company_info.private_company_names})



@app.route('/api/import-power-consumption', methods=['POST'])
@api_log_and_auth
def import_power_consumption_endpoint():
    """
    Endpoint to import power consumption data via uploaded CSV file.
    Accepts multipart/form-data with 'file' field containing the CSV.
    Returns JSON with counts of added, updated, skipped rows.
    """
    if 'file' not in request.files:
        return api_response(status="error", message="Missing CSV file in 'file' field", code=400)

    file_storage = request.files['file']
    try:
        stream = io.StringIO(file_storage.stream.read().decode('utf-8-sig'))
        company_type = session.get("company", "public")
        if company_type == "private":
            result = db.import_power_consumption_new_table(stream)
        else:
            result = db.import_power_consumption(stream)

        if result is False:
            return api_response(status="error", message="Import failed due to database or parsing error", code=500)

        return api_response(status="success", message="Import completed", data=result)
    except Exception as e:
        logger.error(f"Error during import: {e}")
        return api_response(status="error", message=str(e), code=500)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@app.after_request
def after_request_logging(response):
    """Log response and session state after each request"""
    if request.method == "OPTIONS":
        logger.info("=== PREFLIGHT RESPONSE SENT ===")
        return response

    logger.info(f"=== AFTER REQUEST {request.endpoint} ===")
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Session modified: {session.modified}")
    logger.info(f"Session contents after request: {dict(session)}")

    if 'user_email' in session:
        session.permanent = False
        session.modified = True
        logger.info("Ensured session persistence after request")

    return add_cors_headers(response)


def add_cors_headers(response):
    """Enhanced CORS settings for better session handling"""
    origin = request.headers.get('Origin')
    allowed_origins = Config.get_cors_origins()

    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = Config.FRONTEND_URL

    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers[
        'Access-Control-Allow-Headers'] = 'Content-Type,X-CSRFToken,Authorization,X-Requested-With,Accept,Origin'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS,PUT,DELETE'
    response.headers['Access-Control-Max-Age'] = '3600'

    if 'user_email' in session:
        response.headers['X-Debug-Session'] = 'authenticated'
        response.headers['X-Debug-User'] = session['user_email']
    else:
        response.headers['X-Debug-Session'] = 'not-authenticated'

    logger.info(f"CORS headers added to response: {dict(response.headers)}")
    return response






@app.route('/api/check-analysis-status', methods=['POST'])
@api_log_and_auth
def check_analysis_status():
    """Check if Analysis API is accessible"""
    try:
        response = requests.get(f"{Config.ANALYSIS_API_BASE}/health", timeout=10)

        if response.status_code == 200:
            return api_response(data={
                "status": "healthy",
                "message": "سرور تحلیل داده‌ها در دسترس است",
                "api_url": Config.ANALYSIS_API_BASE,
                "response_time": "OK"
            })
        else:
            return api_response(status="warning", data={
                "status": "unhealthy",
                "message": f"سرور تحلیل پاسخ غیرمعمول داد (کد {response.status_code})",
                "api_url": Config.ANALYSIS_API_BASE
            })

    except requests.exceptions.Timeout:
        return api_response(status="error", data={
            "status": "timeout",
            "message": "سرور تحلیل پاسخ نمی‌دهد (timeout)",
            "api_url": Config.ANALYSIS_API_BASE
        })
    except requests.exceptions.ConnectionError:
        return api_response(status="error", data={
            "status": "unreachable",
            "message": "امکان اتصال به سرور تحلیل وجود ندارد",
            "api_url": Config.ANALYSIS_API_BASE
        })
    except Exception as e:
        logger.error(f"Analysis API status check failed: {e}")
        return api_response(status="error", data={
            "status": "error",
            "message": f"خطا در بررسی وضعیت سرور: {str(e)}",
            "api_url": Config.ANALYSIS_API_BASE
        })





# ========== Run App ==========
if __name__ == '__main__':
    db = Database()
    logger.info(f"Starting Flask app on {Config.FLASK_HOST}:{Config.FLASK_PORT}")
    logger.info(f"Debug mode: {Config.FLASK_DEBUG}")
    app.run(debug=Config.FLASK_DEBUG, host=Config.FLASK_HOST, port=Config.FLASK_PORT)
