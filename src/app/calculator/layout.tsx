import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculator | Rula Behavioral Health Total Cost of Care',
};

export default function CalculatorLayout({ children }: LayoutProps<'/calculator'>) {
  return children;
}
