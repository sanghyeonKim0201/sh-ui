import { RootLayout } from '@/components/layouts/RootLayout';
import { GlobalProvider } from '@/components/providers';
import Home from './Home';

export default function App() {
  return (
    <GlobalProvider>
      <RootLayout>
        <Home />
      </RootLayout>
    </GlobalProvider>
  );
}
