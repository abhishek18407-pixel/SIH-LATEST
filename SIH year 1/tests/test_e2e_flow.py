import os
import sys
import json
import urllib.parse
import unittest
import httpx

# Ensure root directory is on Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = "http://127.0.0.1:8000"

class TestE2EFlow(unittest.TestCase):

    def test_full_system_e2e_flow(self):
        print("\n=======================================================")
        print(" RUNNING END-TO-END (E2E) SYSTEM INTEGRATION TEST ")
        print("=======================================================")

        # Step 1: Submit Citizen Grievance via POST /api/complaints
        print("\n[STEP 1] Submitting Citizen Grievance via POST /api/complaints...")
        payload = {
            "text": "Severe water logging and blocked drain near Indiranagar Metro Station causing major traffic blockage",
            "citizen_phone": "+919876543210",
            "lat": 12.9784,
            "long": 77.6408
        }
        
        post_res = httpx.post(f"{BASE_URL}/api/complaints", data=payload)
        self.assertEqual(post_res.status_code, 201, f"POST failed: {post_res.text}")
        
        created_data = post_res.json()
        print("Response Payload:")
        print(json.dumps(created_data, indent=2))
        
        complaint_id = created_data["id"]
        tracking_id = created_data["tracking_id"]
        
        # Validations
        self.assertTrue(tracking_id.startswith("#GR-2026-"), f"Invalid tracking ID format: {tracking_id}")
        self.assertEqual(created_data["status"], "PENDING")
        print(f"[PASS] Grievance created successfully with Tracking ID: {tracking_id}")

        # Step 2: Officer Dashboard List Retrieval via GET /api/complaints
        print("\n[STEP 2] Officer Dashboard Query via GET /api/complaints...")
        get_res = httpx.get(f"{BASE_URL}/api/complaints")
        self.assertEqual(get_res.status_code, 200)
        complaints_list = get_res.json()
        
        matching_complaint = next((c for c in complaints_list if c["id"] == complaint_id), None)
        self.assertIsNotNone(matching_complaint, f"Complaint ID {complaint_id} not found in officer list")
        print(f"[PASS] Verified complaint appears in Officer Dashboard stream ({len(complaints_list)} total items).")

        # Step 3: Officer Status Update via PATCH /api/complaints/:id/status
        print(f"\n[STEP 3] Updating Status to IN_PROGRESS via PATCH /api/complaints/{complaint_id}/status...")
        patch_payload = {
            "status": "IN_PROGRESS",
            "notes": "Emergency PWD drainage team dispatched to Indiranagar Metro Station."
        }
        
        patch_res = httpx.patch(f"{BASE_URL}/api/complaints/{complaint_id}/status", json=patch_payload)
        self.assertEqual(patch_res.status_code, 200, f"PATCH failed: {patch_res.text}")
        
        updated_data = patch_res.json()
        self.assertEqual(updated_data["status"], "IN_PROGRESS")
        print(f"[PASS] Status updated to 'IN_PROGRESS' for ID: {complaint_id}")

        # Step 4: Citizen Tracking Timeline Query via GET /api/complaints/track/:tracking_id
        print(f"\n[STEP 4] Querying Timeline via GET /api/complaints/track/{tracking_id}...")
        encoded_tracking_id = urllib.parse.quote(tracking_id)
        
        track_res = httpx.get(f"{BASE_URL}/api/complaints/track/{encoded_tracking_id}")
        self.assertEqual(track_res.status_code, 200, f"Track failed: {track_res.text}")
        
        track_data = track_res.json()
        print("Track Details & Timeline Response:")
        print(json.dumps(track_data, indent=2))
        
        self.assertEqual(track_data["complaint"]["status"], "IN_PROGRESS")
        timeline = track_data["status_timeline"]
        self.assertGreaterEqual(len(timeline), 2)
        
        statuses = [t["new_status"] for t in timeline]
        self.assertIn("PENDING", statuses)
        self.assertIn("IN_PROGRESS", statuses)
        
        notes_logged = [t.get("notes") for t in timeline if t.get("notes")]
        print(f"[PASS] Timeline verification successful! Logged notes: {notes_logged}")

if __name__ == "__main__":
    unittest.main()
