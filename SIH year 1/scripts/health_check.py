import sys
import httpx

TARGETS = [
    {"name": "Backend REST API Complaints Endpoint", "url": "http://127.0.0.1:8000/api/complaints"},
    {"name": "Citizen Portal Frontend (127.0.0.1)", "url": "http://127.0.0.1:3000"},
    {"name": "Citizen Portal Frontend (localhost)", "url": "http://localhost:3000"},
    {"name": "Officer Dashboard Frontend (127.0.0.1)", "url": "http://127.0.0.1:3001"},
    {"name": "Officer Dashboard Frontend (localhost)", "url": "http://localhost:3001"}
]

def run_health_check():
    print("\n=======================================================")
    print("      SYSTEM MULTI-SERVICE HEALTH CHECK VERIFICATION    ")
    print("=======================================================")

    all_passed = True

    for target in TARGETS:
        try:
            res = httpx.get(target["url"], timeout=5.0)
            status_code = res.status_code
            if status_code == 200:
                print(f"[PASS] {target['name']}: HTTP {status_code} OK ({target['url']})")
                if "api/complaints" in target["url"]:
                    data = res.json()
                    print(f"       -- Database Connectivity Verified! Active complaint records in stream: {len(data)}")
            else:
                print(f"[FAIL] {target['name']}: Returned HTTP {status_code} ({target['url']})")
                all_passed = False
        except Exception as err:
            print(f"[FAIL] {target['name']}: Connection Error -> {err} ({target['url']})")
            all_passed = False

    print("-------------------------------------------------------")
    if all_passed:
        print("RESULT: ALL SERVICES ARE HEALTHY & OPERATIONAL (HTTP 200 OK)")
    else:
        print("RESULT: SOME SERVICES FAILED HEALTH CHECK")
        sys.exit(1)

if __name__ == "__main__":
    run_health_check()
