'use client'
import dynamic from 'next/dynamic';

const TransferRequest = dynamic(() => import('./_components/index'), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <TransferRequest />
    </div>
  );
}
