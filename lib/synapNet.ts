// lib/synapNet.ts

export interface SynapNetOutput {
    predictedAge: number;
    efficiency: number;
    activations: {
      inputs: number[];
      hidden: number[];
      outputs: number[];
    };
  }
  
  // Forward pass: MLP with Input(4) -> Hidden(6, ReLU) -> Output(2, Linear/Sigmoid)
  export function runNeuralNetworkInference(
    latencyMs: number,
    armLengthMeters: number,
    modeCode: number, // 0: Visual, 1: Auditory
    efferentConductionMs: number
  ): SynapNetOutput {
    // 1. Normalized Input Vector x ∈ [0, 1]
    const x = [
      Math.min(1.0, Math.max(0.0, (latencyMs - 100) / 1000)), // Scaled Latency
      Math.min(1.0, Math.max(0.0, (armLengthMeters - 0.5) / 0.6)), // Scaled Reach
      modeCode, // Mode (0 or 1)
      Math.min(1.0, efferentConductionMs / 25), // Peripheral Ratio
    ];
  
    // 2. Hidden Layer Weights (4x6 Matrix)
    const W1 = [
      [0.85, -0.42, 0.77, -0.15, 0.63, -0.31],
      [0.12, 0.65, -0.28, 0.44, 0.05, 0.51],
      [-0.35, 0.18, 0.92, -0.61, 0.29, -0.14],
      [0.48, -0.55, 0.33, 0.72, -0.41, 0.39],
    ];
    const b1 = [0.1, -0.05, 0.15, 0.0, 0.08, -0.1];
  
    // Hidden layer dot product + ReLU activation
    const hidden: number[] = new Array(6).fill(0);
    for (let j = 0; j < 6; j++) {
      let sum = b1[j];
      for (let i = 0; i < 4; i++) {
        sum += x[i] * W1[i][j];
      }
      hidden[j] = Math.max(0, sum); // ReLU
    }
  
    // 3. Output Layer Weights (6x2 Matrix: [Efficiency, Biological Age Factor])
    const W2 = [
      [0.62, -0.45],
      [-0.38, 0.55],
      [0.81, -0.29],
      [-0.51, 0.68],
      [0.44, -0.32],
      [-0.22, 0.41],
    ];
    const b2 = [0.2, 0.5];
  
    let rawEfficiency = b2[0];
    let rawAgeFactor = b2[1];
  
    for (let i = 0; i < 6; i++) {
      rawEfficiency += hidden[i] * W2[i][0];
      rawAgeFactor += hidden[i] * W2[i][1];
    }
  
    // Final predictions
    const efficiency = Math.round(
      Math.max(15, Math.min(99, (1 / (1 + Math.exp(-rawEfficiency))) * 100))
    );
  
    let predictedAge = Math.round(18 + rawAgeFactor * 14 + (latencyMs > 300 ? (latencyMs - 300) / 45 : 0));
    predictedAge = Math.max(15, Math.min(72, predictedAge));
  
    return {
      predictedAge,
      efficiency,
      activations: {
        inputs: x,
        hidden: hidden.map((v) => parseFloat(v.toFixed(2))),
        outputs: [efficiency / 100, predictedAge / 100],
      },
    };
  }