import requests

# ساختن یک session برای نگه‌داشتن کوکی‌ها
s = requests.Session()

# لاگین
login_response = s.post("http://127.0.0.1:5000/api/login", json={
    "email": "sadjad.admin@gmail.com",
    "password": "cBgB0fZ90#$0Kp"
})

# بررسی موفق بودن لاگین
print("Login Response:", login_response.json())







# 1
# -----------------
# fidder analysis response check sample
# params = {
#     "company_names": ["بازار بزرگ اطلس", "بناگست"],
#     "start_date": "1403-01-01",
#     "end_date": "1403-01-03"
# }
# analysis_response = s.post("http://127.0.0.1:5000/api/fidder-analysis", json=params)
# print("Analysis Response:", analysis_response.json())
# -----------------








# 2
# -----------------
# # energy comparison backend
# # custom
# params = {
#     "company_names": ["بازار بزرگ اطلس", "بناگست"],
#     "start_date": "1403-01-01",
#     "end_date": "1403-02-03",
#     "period": "custom",
#     "costume_period": 20
# }
# compare_response = s.post("http://127.0.0.1:5000/api/compare-energetic", json=params)
# print("compare Response:", compare_response.json())
# -------------------------








# 3
# -------------------------
# consumptions limitation backend
# params = {
#     "company_names": ["بازار بزرگ اطلس", "بناگست"],
#     "no_limitation_start_date": "1403-01-01",
#     "no_limitation_end_date": "1403-02-01",
#     "limitation_start_date": "1403-02-02",
#     "limitation_end_date": "1403-03-01",
# }
# consumption_limitation_response = s.post("http://127.0.0.1:5000/api/consumption-limitation", json=params)
# print("consumption limitation Response:", consumption_limitation_response.json())













# 4
# -----------------
# get private company names
# response = s.post("http://127.0.0.1:5000/api/get-private-companies")
# print(response.json())
# ----------------


