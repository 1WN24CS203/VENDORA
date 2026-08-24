'use client';

import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="stepper">
      {steps.map((label, index) => (
        <React.Fragment key={label}>
          <div className={`stepper-step ${index === currentStep ? 'active' : ''}`}>
            <div
              className={`stepper-circle ${
                index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="stepper-label">{label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`stepper-line ${index < currentStep ? 'completed' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
