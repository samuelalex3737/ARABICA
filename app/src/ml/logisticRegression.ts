/**
 * Logistic Regression via Mini-Batch Gradient Descent (Pure TypeScript)
 */

export function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Compute mean and standard deviation for each feature
export function fitScaler(features) {
  const n_samples = features.length;
  const n_features = features[0].length;
  
  const mean = new Array(n_features).fill(0);
  const std = new Array(n_features).fill(0);
  
  // Mean
  for (let i = 0; i < n_samples; i++) {
    for (let j = 0; j < n_features; j++) {
      mean[j] += features[i][j];
    }
  }
  for (let j = 0; j < n_features; j++) {
    mean[j] /= n_samples;
  }
  
  // Variance
  for (let i = 0; i < n_samples; i++) {
    for (let j = 0; j < n_features; j++) {
      std[j] += Math.pow(features[i][j] - mean[j], 2);
    }
  }
  for (let j = 0; j < n_features; j++) {
    std[j] = Math.sqrt(std[j] / n_samples);
    if (std[j] === 0) std[j] = 1; // Prevent div by zero
  }
  
  return { mean, std };
}

export function transformFeatures(features, scaler) {
  return features.map(row => 
    row.map((val, j) => (val - scaler.mean[j]) / scaler.std[j])
  );
}

// Shuffle arrays synchronously (for train/test split)
export function shuffleData(features, labels) {
  // Using Math.random is fine here if we don't care about deterministic splits across different runs
  // But for full reproducibility, we could pass our seeded PRNG. We'll use standard random for simplicity here.
  for (let i = features.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [features[i], features[j]] = [features[j], features[i]];
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
}

/**
 * Train Logistic Regression Model
 */
export function trainLogisticRegression(X, y, config = {}) {
  const {
    epochs = 100,
    batchSize = 256,
    initialLr = 0.1,
    lambda = 0.001 // L2 regularization
  } = config;
  
  const n_samples = X.length;
  const n_features = X[0].length;
  
  // Initialize weights (zeros)
  let weights = new Array(n_features).fill(0);
  let bias = 0;
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Learning rate decay
    const lr = initialLr * Math.pow(0.5, Math.floor(epoch / 30));
    
    // Mini-batch iteration
    for (let i = 0; i < n_samples; i += batchSize) {
      const end = Math.min(i + batchSize, n_samples);
      const batchX = X.slice(i, end);
      const batchY = y.slice(i, end);
      const currentBatchSize = end - i;
      
      const gradW = new Array(n_features).fill(0);
      let gradB = 0;
      
      // Compute gradients for batch
      for (let j = 0; j < currentBatchSize; j++) {
        const x_j = batchX[j];
        const y_j = batchY[j];
        const z = dotProduct(x_j, weights) + bias;
        const y_hat = sigmoid(z);
        const error = y_hat - y_j;
        
        for (let k = 0; k < n_features; k++) {
          gradW[k] += error * x_j[k];
        }
        gradB += error;
      }
      
      // Update weights
      for (let k = 0; k < n_features; k++) {
        // Average gradient + L2 regularization penalty
        gradW[k] = (gradW[k] / currentBatchSize) + (lambda * weights[k]);
        
        // Gradient clipping to prevent exploding gradients
        gradW[k] = Math.max(-5, Math.min(5, gradW[k]));
        
        weights[k] -= lr * gradW[k];
      }
      
      gradB = gradB / currentBatchSize;
      gradB = Math.max(-5, Math.min(5, gradB));
      bias -= lr * gradB;
    }
  }
  
  return { weights, bias };
}
