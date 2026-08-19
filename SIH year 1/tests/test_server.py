import os
import sys
import unittest
from fastapi.testclient import TestClient

# Add root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.main import app

client = TestClient(app)

class TestServerAPI(unittest.TestCase):

    def setUp(self):
        self.test_tracking_id = None
        self.test_complaint_id = None

    def test_01_health_check(self):
        print("\n=======================================================")
        print(" RUNNING REST API BACKEND INTEGRATION BENCHMARK ")
        print("=======================================================")
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        print("[PASS] GET /api/health root health check successful.")

    def test_02_create_complaint(self):
        print("\n--- Testing 1. POST /api/complaints ---")
        payload = {
            "text": "Deep hazardous pothole near Trinity Metro Station on MG Road causing severe traffic congestion.",
            "citizen_phone": "+919876543210",
            "lat": 12.9716,
            "long": 77.5946,
            "photo_url": "https://civic.gov.in/uploads/pothole_mgroad.jpg"
        }
        
        response = client.post("/api/complaints", data=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        print("Created Complaint Response:")
        print(data)
        
        # Validations
        self.assertIn("tracking_id", data)
        self.assertTrue(data["tracking_id"].startswith("#GR-2026-"))
        self.assertEqual(data["status"], "PENDING")
        self.assertEqual(data["citizen_phone"], "+919876543210")
        
        # Save tracking_id and id for subsequent tests
        TestServerAPI.test_tracking_id = data["tracking_id"]
        TestServerAPI.test_complaint_id = data["id"]
        print(f"[PASS] Successfully created complaint with Tracking ID: {data['tracking_id']}")

    def test_03_get_complaints_list_and_filters(self):
        print("\n--- Testing 2. GET /api/complaints (Officer Dashboard) ---")
        # Unfiltered list
        response = client.get("/api/complaints")
        self.assertEqual(response.status_code, 200)
        complaints = response.json()
        self.assertIsInstance(complaints, list)
        self.assertGreaterEqual(len(complaints), 1)
        print(f"Retrieved {len(complaints)} total complaints.")
        
        # Filter by status=PENDING
        response_filtered = client.get("/api/complaints?status=PENDING")
        self.assertEqual(response_filtered.status_code, 200)
        filtered_list = response_filtered.json()
        for item in filtered_list:
            self.assertEqual(item["status"], "PENDING")
        print(f"[PASS] Filter by status=PENDING returned {len(filtered_list)} matching items.")

    def test_04_patch_complaint_status(self):
        print("\n--- Testing 3. PATCH /api/complaints/:id/status ---")
        complaint_id = TestServerAPI.test_complaint_id or TestServerAPI.test_tracking_id
        self.assertIsNotNone(complaint_id, "Complaint ID must exist from previous test")
        
        update_payload = {
            "status": "IN_PROGRESS",
            "notes": "Road inspection team dispatched to Trinity Metro Station."
        }
        
        response = client.patch(f"/api/complaints/{complaint_id}/status", json=update_payload)
        self.assertEqual(response.status_code, 200)
        updated_data = response.json()
        
        print("Updated Status Response:")
        print(updated_data)
        
        self.assertEqual(updated_data["status"], "IN_PROGRESS")
        print(f"[PASS] Status updated to 'IN_PROGRESS' for ID: {complaint_id}")

    def test_05_track_complaint_timeline(self):
        print("\n--- Testing 4. GET /api/complaints/track/:tracking_id ---")
        tracking_id = TestServerAPI.test_tracking_id
        self.assertIsNotNone(tracking_id, "Tracking ID must exist")
        
        # Encode # as %23 if needed or pass clean code
        clean_code = tracking_id.replace("#", "%23")
        response = client.get(f"/api/complaints/track/{clean_code}")
        self.assertEqual(response.status_code, 200)
        track_data = response.json()
        
        print("Track Complaint Details & Timeline:")
        print(track_data)
        
        self.assertIn("complaint", track_data)
        self.assertIn("status_timeline", track_data)
        
        timeline = track_data["status_timeline"]
        self.assertGreaterEqual(len(timeline), 2)  # PENDING initial log + IN_PROGRESS log
        
        statuses_logged = [log["new_status"] for log in timeline]
        self.assertIn("PENDING", statuses_logged)
        self.assertIn("IN_PROGRESS", statuses_logged)
        print(f"[PASS] Timeline verification successful! Logged status history: {statuses_logged}")

if __name__ == "__main__":
    unittest.main()
