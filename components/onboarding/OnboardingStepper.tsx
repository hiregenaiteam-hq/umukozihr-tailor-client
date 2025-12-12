import React from 'react';
import { Check, Circle } from 'lucide-react';

interface OnboardingStepperProps {
  currentStep: number;
  steps: string[];
  completedSteps: number[];
}

export default function OnboardingStepper({ currentStep, steps, completedSteps }: OnboardingStepperProps) {
  return (
    <div className="mb-8">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isPast = stepNumber < currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted || isPast
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : isCurrent
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20'
                        : 'glass-subtle text-stone-500'
                    }
                  `}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full animate-pulse-glow" />
                  )}
                </div>
                
                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors
                    ${isCurrent ? 'text-orange-400' : isPast || isCompleted ? 'text-white' : 'text-stone-500'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-12 lg:w-20 h-0.5 mx-2 -mt-6">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-500
                      ${stepNumber < currentStep
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                        : 'bg-white/10'
                      }
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-400">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gradient">{steps[currentStep - 1]}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
