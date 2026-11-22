from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
from dataclasses import dataclass

@dataclass
class DFUInferenceResult:
    predicted_grade: int  # 1, 2, 3, or 4
    confidence_score: float  # e.g., 0.948
    probabilities: Dict[str, float]  # {"Grade 1": 0.03, "Grade 2": 0.92, "Grade 3": 0.04, "Grade 4": 0.01}
    risk_severity: str  # "Low to Moderate", "Moderate to High", "High / Severe", "Critical / Emergency"
    ai_rationale: str
    gradcam_path: str  # Path to saved Grad-CAM blended overlay image

class BaseDFUModel(ABC):
    """
    Abstract interface for Diabetic Foot Ulcer Grade 1-4 classification models.
    Supports plug-and-play integration for models trained in Google Colab (TensorFlow/Keras, PyTorch, ONNX).
    """

    @abstractmethod
    def load_weights(self, weights_path: str) -> bool:
        """Load model weights from the specified path."""
        pass

    @abstractmethod
    def predict_and_explain(
        self,
        image_path: str,
        output_gradcam_path: str,
        clinical_context: Dict[str, Any] = None
    ) -> DFUInferenceResult:
        """
        Run inference on an ulcer clinical image and generate Grad-CAM explainability map.
        
        Args:
            image_path: Path to the input RGB clinical ulcer image.
            output_gradcam_path: Destination path to save the generated Grad-CAM heatmap overlay.
            clinical_context: Optional dictionary with lesion depth, diameter, exudate, etc.
            
        Returns:
            DFUInferenceResult containing predicted Wagner grade, confidence, probability breakdown, and rationale.
        """
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Return metadata about current active model, input resolution, classes, and layer names."""
        pass
