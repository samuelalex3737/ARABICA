/**
 * Training Script for ML Model
 * Run with: npm run train (uses tsx)
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateTrainingData } from '../src/ml/monteCarloSim.js';
import { fitScaler, transformFeatures, shuffleData, trainLogisticRegression } from '../src/ml/logisticRegression.js';
import { evaluateModel } from '../src/ml/evaluation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('1. Generating 50,000 Monte Carlo samples...');
  const { features, labels } = generateTrainingData(50000);
  console.log(`   Generated ${features.length} samples with 8 features each.`);
  
  const numAccept = labels.filter(l => l === 1).length;
  console.log(`   Class balance: ${(numAccept / labels.length * 100).toFixed(1)}% Accept (NPV > 0)`);
  
  console.log('2. Splitting into Train (80%) and Test (20%)...');
  // Shuffle in place
  shuffleData(features, labels);
  
  const splitIdx = Math.floor(features.length * 0.8);
  const X_train = features.slice(0, splitIdx);
  const y_train = labels.slice(0, splitIdx);
  const X_test = features.slice(splitIdx);
  const y_test = labels.slice(splitIdx);
  
  console.log('3. Scaling features (Z-Score Standardization)...');
  const scaler = fitScaler(X_train);
  const X_train_scaled = transformFeatures(X_train, scaler);
  // We'll scale X_test during evaluation using the evaluateModel function which takes the full model object.
  
  console.log('4. Training Logistic Regression via Mini-Batch Gradient Descent...');
  const config = {
    epochs: 100,
    batchSize: 256,
    initialLr: 0.1,
    lambda: 0.001
  };
  
  const { weights, bias } = trainLogisticRegression(X_train_scaled, y_train, config);
  
  const model = {
    weights,
    bias,
    scaler
  };
  
  console.log('5. Evaluating model on held-out test set...');
  const metrics = evaluateModel(X_test, y_test, model);
  
  console.table({
    'Accuracy': metrics.accuracy.toFixed(4),
    'ROC-AUC': metrics.roc_auc.toFixed(4),
    'Precision': metrics.precision.toFixed(4),
    'Recall': metrics.recall.toFixed(4),
    'F1-Score': metrics.f1.toFixed(4),
    'Brier Score': metrics.brier_score.toFixed(4)
  });
  
  console.log('6. Exporting trained model weights to JSON...');
  const outputObj = {
    ...model,
    metrics,
    training_config: {
      n_samples: 50000,
      ...config,
      seed: 42
    }
  };
  
  const outputPath = path.join(__dirname, '../src/ml/trainedWeights.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputObj, null, 2));
  
  console.log(`   Model exported successfully to: ${outputPath}`);
  console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
