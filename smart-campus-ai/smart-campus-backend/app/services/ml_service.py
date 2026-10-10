import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict, Any, Optional

SEGMENTS = [
    "All-Round High Achiever",
    "Academic Scholar (Placement Risk)",
    "Practical Hustler",
    "Critical Intervention Required"
]

class MLService:
    def __init__(self, n_clusters: int = 4):
        self.n_clusters = n_clusters
        self.kmeans: Optional[KMeans] = None
        self.cluster_to_segment_map: Dict[int, str] = {}
        self.is_fitted = False
        
        # Default initialization with characteristic cluster centroids
        self._initialize_default_model()

    def _initialize_default_model(self):
        """
        Initializes KMeans with reference synthetic baseline anchors:
        Feature vector: [academic, placement, lms, engagement, attendance]
        """
        initial_data = np.array([
            [90.0, 88.0, 92.0, 85.0, 92.0],  # All-Round High Achiever
            [85.0, 42.0, 75.0, 30.0, 88.0],  # Academic Scholar (Placement Risk)
            [55.0, 85.0, 60.0, 80.0, 70.0],  # Practical Hustler
            [35.0, 30.0, 30.0, 15.0, 52.0],  # Critical Intervention Required
        ], dtype=float)

        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.kmeans.fit(initial_data)
        self._map_clusters_to_segments(self.kmeans.cluster_centers_)
        self.is_fitted = True

    def _map_clusters_to_segments(self, centers: np.ndarray):
        """
        Assigns semantic segment labels to cluster indexes based on centroid characteristics:
        Centers columns: 0=academic, 1=placement, 2=lms, 3=engagement, 4=attendance
        """
        mapped: Dict[int, str] = {}
        remaining_indices = list(range(self.n_clusters))

        # 1. Critical Intervention: lowest average or lowest academic + placement
        crit_idx = min(remaining_indices, key=lambda idx: centers[idx][0] + centers[idx][1] + centers[idx][4])
        mapped[crit_idx] = "Critical Intervention Required"
        remaining_indices.remove(crit_idx)

        # 2. All-Round High Achiever: highest overall sum among remaining
        high_idx = max(remaining_indices, key=lambda idx: float(np.sum(centers[idx])))
        mapped[high_idx] = "All-Round High Achiever"
        remaining_indices.remove(high_idx)

        # 3. Academic Scholar (Placement Risk): higher academic than placement
        # 4. Practical Hustler: higher placement / engagement relative to academic
        if len(remaining_indices) == 2:
            idx_a, idx_b = remaining_indices[0], remaining_indices[1]
            diff_a = centers[idx_a][0] - centers[idx_a][1]  # academic - placement
            diff_b = centers[idx_b][0] - centers[idx_b][1]
            if diff_a > diff_b:
                mapped[idx_a] = "Academic Scholar (Placement Risk)"
                mapped[idx_b] = "Practical Hustler"
            else:
                mapped[idx_b] = "Academic Scholar (Placement Risk)"
                mapped[idx_a] = "Practical Hustler"

        self.cluster_to_segment_map = mapped

    def fit_cohort(self, feature_matrix: List[List[float]]):
        """
        Trains or updates the KMeans model on a real cohort dataset.
        """
        if len(feature_matrix) < self.n_clusters:
            return  # Keep current model if not enough data points
        
        X = np.array(feature_matrix, dtype=float)
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.kmeans.fit(X)
        self._map_clusters_to_segments(self.kmeans.cluster_centers_)
        self.is_fitted = True

    def predict_segment(self, pillars: Dict[str, float]) -> str:
        """
        Predicts student segment based on pillars:
        academic, placement, lms, engagement, attendance
        Falls back to rule-guided segmentation for extreme edge cases.
        """
        academic = pillars.get("academic", 0.0)
        placement = pillars.get("placement", 0.0)
        lms = pillars.get("lms", 0.0)
        engagement = pillars.get("engagement", 0.0)
        attendance = pillars.get("attendance", 0.0)

        # Rule overrides for clear boundary cases
        if academic < 45.0 and (placement < 45.0 or attendance < 60.0):
            return "Critical Intervention Required"
        if academic >= 75.0 and placement < 55.0:
            return "Academic Scholar (Placement Risk)"
        if placement >= 70.0 and (engagement >= 60.0 or academic < 70.0):
            return "Practical Hustler"
        if academic >= 80.0 and placement >= 75.0 and attendance >= 80.0:
            return "All-Round High Achiever"

        # ML-based cluster prediction
        if self.kmeans and self.is_fitted:
            features = np.array([[academic, placement, lms, engagement, attendance]], dtype=float)
            cluster_id = int(self.kmeans.predict(features)[0])
            return self.cluster_to_segment_map.get(cluster_id, "All-Round High Achiever")

        return "All-Round High Achiever"

# Global singleton instance
ml_service = MLService()
