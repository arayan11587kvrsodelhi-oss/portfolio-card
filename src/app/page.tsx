import PortfolioCard from '@/components/PortfolioCard/PortfolioCard';
import { getPortfolioData } from '@/lib/portfolio';

// Data is read on the server and streamed as props to the client card.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getPortfolioData();
  return <PortfolioCard data={data} />;
}
