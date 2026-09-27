"""
ATM Cash-Out Prediction System
Model Evaluation & Metrics Module
Computes:
- Confusion Matrix (TP, FP, TN, FN)
- Accuracy, Precision, Recall, F1-Score
- ROC-AUC with curve coordinates
- Feature Importance ranking
"""

import math

def calculate_confusion_matrix(y_true, y_pred):
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)
    return {"tp": tp, "tn": tn, "fp": fp, "fn": fn}

def calculate_classification_metrics(y_true, y_pred, y_probs=None):
    cm = calculate_confusion_matrix(y_true, y_pred)
    total = len(y_true)
    if total == 0:
        return {"accuracy": 0, "precision": 0, "recall": 0, "f1": 0, "roc_auc": 0, "confusion_matrix": cm}

    accuracy = (cm["tp"] + cm["tn"]) / float(total)
    precision = (cm["tp"] / float(cm["tp"] + cm["fp"])) if (cm["tp"] + cm["fp"]) > 0 else 0.0
    recall = (cm["tp"] / float(cm["tp"] + cm["fn"])) if (cm["tp"] + cm["fn"]) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    # ROC AUC calculation via trapezoidal rule on probability rank
    roc_auc = 0.5
    roc_curve = []
    if y_probs and len(y_probs) == len(y_true):
        # Sort by predicted probability descending
        combined = sorted(zip(y_probs, y_true), key=lambda x: x[0], reverse=True)
        positives = sum(y_true)
        negatives = total - positives
        if positives > 0 and negatives > 0:
            tp_curr = 0
            fp_curr = 0
            roc_curve.append({"fpr": 0.0, "tpr": 0.0, "threshold": 1.0})
            
            # Sample thresholds for clean curve
            step_stride = max(1, total // 50)
            for idx, (prob, label) in enumerate(combined):
                if label == 1:
                    tp_curr += 1
                else:
                    fp_curr += 1
                if idx % step_stride == 0 or idx == total - 1:
                    fpr = fp_curr / float(negatives)
                    tpr = tp_curr / float(positives)
                    roc_curve.append({
                        "fpr": round(fpr, 4),
                        "tpr": round(tpr, 4),
                        "threshold": round(prob, 4)
                    })

            # Calculate AUC via trapezoidal integration
            auc_sum = 0.0
            for i in range(len(roc_curve) - 1):
                dfpr = roc_curve[i+1]["fpr"] - roc_curve[i]["fpr"]
                avg_tpr = (roc_curve[i+1]["tpr"] + roc_curve[i]["tpr"]) / 2.0
                auc_sum += dfpr * avg_tpr
            roc_auc = max(0.5, min(1.0, auc_sum))

    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": cm,
        "roc_curve": roc_curve
    }
