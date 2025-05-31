import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, ExternalLink } from 'lucide-react';
import { bc } from '../../lib/blockchain';

type Props = {
  id: string;
  name: string;
  image: string;
  owner: string;
};

export function BadgeNFT({ id, name, image, owner }: Props) {
  const [vrf, setVrf] = useState(false);
  const [ldg, setLdg] = useState(false);
  
  const handleVerify = async () => {
    try {
      setLdg(true);
      const result = await bc.verify(id);
      setVrf(result.owner.toLowerCase() === owner.toLowerCase());
    } catch (e) {
      console.error('Verification failed:', e);
    } finally {
      setLdg(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">{name}</h3>
          </div>
          
          {vrf && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Verified
            </span>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <QRCodeSVG
            value={`${window.location.origin}/badge/${id}`}
            size={200}
            className="rounded-lg"
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleVerify}
            disabled={ldg}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {ldg ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white" />
            ) : (
              'Verify on Chain'
            )}
          </button>
          
          <a
            href={`https://etherscan.io/token/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            View on Etherscan
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}