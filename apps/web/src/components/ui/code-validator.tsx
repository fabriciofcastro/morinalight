"use client";


export interface CodeValidatorProps {
  length?: number;
  onComplete?: (code: string) => void;
  [key: string]: any;
}

export function CodeValidator({ length = 6, onComplete, ...props }: CodeValidatorProps) {
  return (
    <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
      CodeValidator component missing from UI library. Placeholder rendered with props: {JSON.stringify(props)}
    </div>
  );
}
