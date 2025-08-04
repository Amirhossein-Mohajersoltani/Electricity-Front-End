import jdatetime
import requests



def get_years_between(start_date_str, end_date_str):
    start_date = jdatetime.datetime.strptime(start_date_str.replace("/", "-"), "%Y-%m-%d")
    end_date = jdatetime.datetime.strptime(end_date_str.replace("/", "-"), "%Y-%m-%d")
    start_year = start_date.year
    end_year = end_date.year
    return [int(year) for year in range(start_year, end_year + 1)]


def admin_request(start_date,end_date,years , region_codes, fidder_codes, company_id, base_url):
    daily_peak_params = {
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes,
        "fidder_code": fidder_codes,
        "company_id": company_id
    }
    daily_peak_response = requests.post(f"{base_url}/daily-peak", json=daily_peak_params).json()
    daily_profile_max_params = {
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes,
        "fidder_code": fidder_codes,
        "company_id": company_id,
        "method": "max"
    }
    daily_profile_max_response = requests.post(f"{base_url}/daily-profile",
                                               json=daily_profile_max_params).json()
    daily_profile_mean_params = {
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes,
        "fidder_code": fidder_codes,
        "company_id": company_id,
        "method": "mean"
    }
    daily_profile_mean_response = requests.post(f"{base_url}/daily-profile",
                                                json=daily_profile_mean_params).json()
    long_term_params = {
        "year": years,
        "fidder_code": fidder_codes,
        "region_code": region_codes,
        "company_id": company_id
    }
    long_term_response = requests.post(f"{base_url}/long-term", json=long_term_params).json()
    weekly_peak_params = {
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes,
        "fidder_code": fidder_codes,
        "company_id": company_id
    }
    weekly_peak_response = requests.post(f"{base_url}/weekly-peak", json=weekly_peak_params).json()
    load_continuity_params = {
        "start_date": start_date,
        "end_date": end_date,
        "region_code": region_codes,
        "fidder_code": fidder_codes,
        "company_id": company_id
    }
    load_continuity_response = requests.post(f"{base_url}/Load-continuity", json=load_continuity_params).json()
    print(daily_profile_max_params)
    print(daily_profile_mean_params)
    print(daily_peak_params)
    print(load_continuity_params)
    print(long_term_params)
    return {
        "load_continuity": load_continuity_response,
        "daily_peak": daily_peak_response,
        "long_term": long_term_response,
        "weekly_peak": weekly_peak_response,
        "daily_profile_max": daily_profile_max_response,
        "daily_profile_mean": daily_profile_mean_response
    }
