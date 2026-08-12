/**
 * Evaluation Metrics for Logistic Regression
 */
import { dotProduct, sigmoid, transformFeatures } from './logisticRegression.js';

export function predict(X, model) {
  const scaledX = transformFeatures(X, model.scaler);
  return scaledX.map(x => sigmoid(dotProduct(x, model.weights) + model.bias));
}

export function evaluateModel(X, y, model) {
  const y_prob = predict(X, model);
  
  // Hard classification (threshold 0.5)
  const y_pred = y_prob.map(p => (p > 0.5 ? 1 : 0));
  
  let tp = 0, fp = 0, tn = 0, fn = 0;
  let brierSum = 0;
  
  for (let i = 0; i < y.length; i++) {
    const actual = y[i];
    const pred = y_pred[i];
    const prob = y_prob[i];
    
    if (actual === 1 && pred === 1) tp++;
    if (actual === 0 && pred === 1) fp++;
    if (actual === 0 && pred === 0) tn++;
    if (actual === 1 && pred === 0) fn++;
    
    brierSum += Math.pow(prob - actual, 2);
  }
  
  const accuracy = (tp + tn) / y.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;
  const brier_score = brierSum / y.length;
  
  // Compute ROC-AUC
  const roc_auc = computeROCAUC(y, y_prob);
  
  return {
    accuracy,
    precision,
    recall,
    f1,
    roc_auc,
    brier_score
  };
}

function computeROCAUC(y_true, y_prob) {
  // Pair up probabilities with true labels
  const pairs = y_prob.map((prob, i) => ({ prob, label: y_true[i] }));
  
  // Sort descending by probability
  pairs.sort((a, b) => b.prob - a.prob);
  
  let numPos = y_true.filter(l => l === 1).length;
  let numNeg = y_true.length - numPos;
  
  if (numPos === 0 || numNeg === 0) return 0;
  
  let tp = 0, fp = 0;
  let tpPrev = 0, fpPrev = 0;
  let auc = 0;
  
  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i];
    if (p.label === 1) {
      tp++;
    } else {
      fp++;
    }
    
    // Trapezoidal rule when probability changes or end of list
    if (i === pairs.length - 1 || pairs[i].prob !== pairs[i+1].prob) {
      auc += trapezoidArea(fpPrev, fp, tpPrev, tp);
      tpPrev = tp;
      fpPrev = fp;
    }
  }
  
  return auc / (numPos * numNeg);
}

function trapezoidArea(x1, x2, y1, y2) {
  const base = Math.abs(x1 - x2);
  const height = (y1 + y2) / 2.0;
  return base * height;
}
