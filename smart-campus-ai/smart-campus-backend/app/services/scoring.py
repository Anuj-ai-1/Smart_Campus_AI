from typing import Dict, List, Tuple, Any

def calculate_pillars(
    cgpa: float,
    backlogs: int,
    attendance: float,
    lms_login_freq_weekly: int,
    lms_completion_rate: float,
    aptitude_score: float,
    coding_score: float,
    mock_interview_score: float,
    certifications_count: int,
    hackathons_count: int,
) -> Dict[str, float]:
    """
    Calculates the 5 success pillars using the specified formulas:
    - Academic Pillar: min(100.0, max(0.0, (cgpa / 10.0 * 100) - (backlogs * 12)))
    - Placement Pillar: (aptitude_score * 0.35) + (coding_score * 0.45) + (mock_interview_score * 0.20)
    - LMS Pillar: (lms_completion_rate * 0.7) + (min(lms_login_freq_weekly / 7.0, 1.0) * 100 * 0.3)
    - Engagement Pillar: min(100.0, (certifications_count * 20.0) + (hackathons_count * 20.0) + (20.0 if attendance >= 80 else 5.0))
    - Attendance Pillar: min(100.0, max(0.0, attendance))
    """
    academic = min(100.0, max(0.0, (cgpa / 10.0 * 100.0) - (backlogs * 12.0)))
    placement = min(100.0, max(0.0, (aptitude_score * 0.35) + (coding_score * 0.45) + (mock_interview_score * 0.20)))
    lms = min(100.0, max(0.0, (lms_completion_rate * 0.7) + (min(float(lms_login_freq_weekly) / 7.0, 1.0) * 100.0 * 0.3)))
    attendance_clamped = min(100.0, max(0.0, attendance))
    engagement = min(100.0, max(0.0, (certifications_count * 20.0) + (hackathons_count * 20.0) + (20.0 if attendance >= 80.0 else 5.0)))

    return {
        "academic": round(academic, 1),
        "attendance": round(attendance_clamped, 1),
        "placement": round(placement, 1),
        "lms": round(lms, 1),
        "engagement": round(engagement, 1),
        "extracurricular": round(engagement, 1),  # Frontend compatibility alias
    }

def calculate_success_score(pillars: Dict[str, float]) -> float:
    """
    Student Success Score (SSS):
    round((academic * 0.30) + (attendance * 0.20) + (placement * 0.20) + (lms * 0.15) + (engagement * 0.15), 1)
    """
    score = (
        (pillars["academic"] * 0.30)
        + (pillars["attendance"] * 0.20)
        + (pillars["placement"] * 0.20)
        + (pillars["lms"] * 0.15)
        + (pillars["engagement"] * 0.15)
    )
    return round(score, 1)

def determine_risk_flags(cgpa: float, backlogs: int, attendance: float, placement_pillar: float) -> List[str]:
    """
    - Add "Academic Risk" if cgpa < 6.5 or backlogs > 0 or attendance < 75.0
    - Add "Placement Risk" if placement < 60.0
    - Default to ["Safe"] if no risks are flagged.
    """
    flags = []
    if cgpa < 6.5 or backlogs > 0 or attendance < 75.0:
        flags.append("Academic Risk")
    if placement_pillar < 60.0:
        flags.append("Placement Risk")
    
    if not flags:
        flags.append("Safe")
    return flags

def generate_explainability(
    cgpa: float,
    backlogs: int,
    attendance: float,
    lms_login_freq_weekly: int,
    lms_completion_rate: float,
    aptitude_score: float,
    coding_score: float,
    mock_interview_score: float,
    certifications_count: int,
    hackathons_count: int,
) -> Tuple[List[str], List[str]]:
    """
    Generates top 3 positive strengths and top 3 negative risk drivers based on deviations.
    """
    potential_strengths = []
    potential_risks = []

    # Strengths
    if attendance >= 85.0:
        potential_strengths.append(f"High attendance record ({attendance}%)")
    if cgpa >= 8.0:
        potential_strengths.append(f"Strong academic CGPA ({cgpa}/10)")
    if coding_score >= 75.0:
        potential_strengths.append(f"Coding score above benchmark ({coding_score}/100)")
    if aptitude_score >= 75.0:
        potential_strengths.append(f"Strong analytical & aptitude score ({aptitude_score}/100)")
    if lms_completion_rate >= 85.0:
        potential_strengths.append(f"Consistent LMS coursework completion ({lms_completion_rate}%)")
    if hackathons_count >= 2:
        potential_strengths.append(f"Active hackathon participation ({hackathons_count} events)")
    if certifications_count >= 2:
        potential_strengths.append(f"Industry certifications earned ({certifications_count} verified)")
    if lms_login_freq_weekly >= 5:
        potential_strengths.append(f"High LMS weekly platform engagement ({lms_login_freq_weekly} days/wk)")
    if mock_interview_score >= 75.0:
        potential_strengths.append(f"Solid mock interview performance ({mock_interview_score}/100)")

    # Risks
    if attendance < 75.0:
        potential_risks.append(f"Attendance below 75% statutory threshold ({attendance}%)")
    if backlogs > 0:
        potential_risks.append(f"{backlogs} active backlog subject{'s' if backlogs > 1 else ''}")
    if cgpa < 6.5:
        potential_risks.append(f"CGPA below 6.5 academic benchmark ({cgpa}/10)")
    if coding_score < 50.0:
        potential_risks.append(f"Coding readiness below benchmark ({coding_score}/100)")
    if aptitude_score < 60.0:
        potential_risks.append(f"Aptitude score below placement cutoff ({aptitude_score}/100)")
    if lms_completion_rate < 60.0:
        potential_risks.append(f"Low LMS coursework completion ({lms_completion_rate}%)")
    if certifications_count == 0 and hackathons_count == 0:
        potential_risks.append("No recorded certifications or hackathon participation")
    if mock_interview_score < 50.0:
        potential_risks.append(f"Mock interview readiness requires attention ({mock_interview_score}/100)")

    top_strengths = potential_strengths[:3] if potential_strengths else ["Steady baseline academic performance"]
    top_risks = potential_risks[:3] if potential_risks else ["No critical risk drivers identified"]

    return top_strengths, top_risks

def generate_recommended_action(
    cgpa: float,
    backlogs: int,
    attendance: float,
    coding_score: float,
    aptitude_score: float,
    lms_completion_rate: float,
    certifications_count: int,
    hackathons_count: int,
    risk_flags: List[str]
) -> str:
    """
    Generates prescriptive remediation recommendation string based on primary deficiency.
    """
    if backlogs > 0:
        return f"Meet Academic Advisor for backlog clearance plan and enroll in subject remedial tutoring."
    if attendance < 75.0:
        return "Mandatory attendance improvement plan: Attend all scheduled classes for next 3 weeks to regain eligibility."
    if coding_score < 50.0:
        return "Join Saturday DSA & Coding Assessment Bootcamp in Lab 3 (target score 60+)."
    if aptitude_score < 60.0:
        return "Complete 3 quantitative and logical aptitude practice modules on the student portal this week."
    if cgpa < 6.5:
        return "Enroll in peer tutoring sessions (Tue & Thu at Library Seminar Hall) to boost core GPA."
    if lms_completion_rate < 75.0:
        return "Submit pending LMS module assignments before weekly deadline to restore coursework score."
    if certifications_count < 2:
        return "Earn at least one industry-recognized certification (Cloud, AI, or Fullstack track)."
    if hackathons_count == 0:
        return "Register for the upcoming campus hackathon with a team of 2-4 peers to build portfolio projects."
    
    return "Eligible for advanced honors project and nominated as peer mentor in student learning program."
