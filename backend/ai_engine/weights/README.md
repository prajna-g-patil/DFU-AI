# DFU-AI Model Weights Directory

This folder is the designated target location for your trained TensorFlow / Keras diabetic foot ulcer model from Google Colab.

## Supported Model Formats
- `.keras` (Recommended for Keras 3 / TensorFlow 2.16+)
- `.h5` (HDF5 format from `model.save('dfu_model.h5')`)
- SavedModel directory

## How to Export from Google Colab

In your Google Colab notebook, save and download your trained model:

```python
# In your Google Colab Notebook
import tensorflow as tf

# Example: Save your trained Wagner classifier model
model.save("dfu_wagner_classifier.keras")

# Download the file to your computer
from google.colab import files
files.download("dfu_wagner_classifier.keras")
```

Then copy `dfu_wagner_classifier.keras` into this folder:
`backend/ai_engine/weights/dfu_wagner_classifier.keras`

The DFU-AI backend will automatically detect the file on startup, load the architecture, and use your exact convolutional layer for Grad-CAM backpropagation.
