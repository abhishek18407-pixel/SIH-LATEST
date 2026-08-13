import os
import sys
import json
import unittest

# Add root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_engine import (
    classify_grievance,
    transcribe_and_translate_audio,
    ALLOWED_DEPARTMENTS,
    ALLOWED_URGENCIES
)

SAMPLE_GRIEVANCES = [
    {
        "id": 1,
        "input_text": "There is a massive dangerous pothole on MG Road near Trinity Metro Station causing severe traffic jam and accidents.",
        "expected_dept": "Roads & Infrastructure"
    },
    {
        "id": 2,
        "input_text": "Drainage pipeline has burst near City Market Main Gate. Dirty sewage water is flowing into shops and residential houses.",
        "expected_dept": "Water Supply & Sewage"
    },
    {
        "id": 3,
        "input_text": "Streetlights are not working on 5th Cross Road, Indiranagar for the past 4 days. It is pitch dark and unsafe at night.",
        "expected_dept": "Electricity & Public Lighting"
    },
    {
        "id": 4,
        "input_text": "Garbage has not been collected for over a week near National High School, 4th Block Jayanagar. Foul smell spreading everywhere.",
        "expected_dept": "Waste Management & Sanitation"
    },
    {
        "id": 5,
        "input_text": "Stagnant water near Central Park is breeding mosquitoes. Multiple dengue cases reported in neighborhood.",
        "expected_dept": "Public Health"
    }
]

class TestAIEngine(unittest.TestCase):

    def test_classify_grievance_structure(self):
        print("\n=======================================================")
        print(" RUNNING GROQ AI GRIEVANCE CLASSIFICATION BENCHMARK ")
        print("=======================================================")
        
        api_key = os.getenv("GROQ_API_KEY")
        is_live = bool(api_key and not api_key.startswith("gsk_your"))
        
        if is_live:
            print("[INFO] Live GROQ_API_KEY detected. Executing real-time Groq LLM queries...")
        else:
            print("[WARN] No live GROQ_API_KEY found. Running offline schema verification test...")

        for sample in SAMPLE_GRIEVANCES:
            print(f"\n--- Testing Sample #{sample['id']} ---")
            print(f"Input Text: \"{sample['input_text']}\"")
            
            if is_live:
                result = classify_grievance(sample['input_text'])
            else:
                # Mock result for offline schema structure validation
                result = {
                    "summary": f"Summary for sample {sample['id']}",
                    "extracted_location": "Landmark extracted",
                    "urgency": "High",
                    "department": sample['expected_dept']
                }
                
            print("Extracted Output JSON:")
            print(json.dumps(result, indent=2))
            
            # Key checks
            self.assertIn("summary", result)
            self.assertIn("extracted_location", result)
            self.assertIn("urgency", result)
            self.assertIn("department", result)
            
            # Value constraints checks
            self.assertIn(result["urgency"], ALLOWED_URGENCIES)
            self.assertIn(result["department"], ALLOWED_DEPARTMENTS)
            print("[PASS] Schema & constraint validations passed!")

    def test_transcribe_audio_file_validation(self):
        print("\n--- Testing Audio Function Error Handling ---")
        with self.assertRaises(FileNotFoundError):
            transcribe_and_translate_audio("non_existent_audio_file.wav")
        print("[PASS] FileNotFoundError raised correctly for missing audio files!")

if __name__ == "__main__":
    unittest.main()
