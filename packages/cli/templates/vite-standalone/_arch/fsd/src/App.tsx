import { GlobalProvider } from '@/app/providers/GlobalProvider';
import { RootLayout } from '@/app/layouts/RootLayout';
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
