import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, Briefcase, GraduationCap, FolderKanban, Sparkles, Link2, ClipboardCheck } from 'lucide-react';

interface OnboardingStepperProps {
  currentStep: number;
  steps: string[];
  completedSteps: number[];
}

// Step icons mapping
const stepIcons: { [key: string]: React.ElementType } = {
  'Basics': User,
  'Experience': Briefcase,
  'Education': GraduationCap,
  'Projects': FolderKanban,
  'Skills': Sparkles,
  'Extras': Link2,
  'Review': ClipboardCheck,
};

export default function OnboardingStepper({ currentStep, steps, completedSteps }: OnboardingStepperProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        {/* Progress bar background */}
        <div className="relative">
          {/* Background track */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-stone-800/50 rounded-full mx-12" />
          
          {/* Animated progress fill */}
          <motion.div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-full mx-12"
            initial={{ width: 0 }}
            animate={{ width: `calc(${progress}% - 6rem)` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Steps */}
          <div className="relative flex justify-between items-start">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
              const isCurrent = currentStep === stepNumber;
              const Icon = stepIcons[step] || User;

              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  {/* Step Circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300 border-2
                      ${isCompleted
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400/50 text-white shadow-lg shadow-orange-500/30'
                        : isCurrent
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-300 text-white shadow-xl shadow-orange-500/40 ring-4 ring-orange-500/20'
                          : 'bg-stone-900/80 border-stone-700 text-stone-500'
                      }
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="h-5 w-5" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    
                    {/* Current step glow effect */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-orange-500/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Step Label */}
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className={`
                      mt-3 text-xs font-medium transition-colors whitespace-nowrap
                      ${isCurrent 
                        ? 'text-orange-400' 
                        : isCompleted 
                          ? 'text-stone-300' 
                          : 'text-stone-600'
                      }
                    `}
                  >
                    {step}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress - Enhanced */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-sm font-bold text-white">{currentStep}</span>
            </div>
            <div>
              <p className="text-xs text-stone-500">Step {currentStep} of {steps.length}</p>
              <p className="text-sm font-semibold text-white">{steps[currentStep - 1]}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gradient">{Math.round((currentStep / steps.length) * 100)}%</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-stone-800/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Step dots */}
        <div className="flex justify-between mt-2 px-1">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = currentStep === stepNumber;
            
            return (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-orange-500 w-4'
                    : isCompleted
                      ? 'bg-orange-500/70'
                      : 'bg-stone-700'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
