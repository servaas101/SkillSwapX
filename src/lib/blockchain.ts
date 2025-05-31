import { ethers } from 'ethers';
import { sb } from './supabase';

// Badge contract ABI
const abi = [
  "function mint(address to, string uri)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

// Blockchain service
export const bc = {
  // Initialize provider
  async init() {
    const provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL
    );
    
    const contract = new ethers.Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS,
      abi,
      provider
    );
    
    return { provider, contract };
  },
  
  // Mint badge NFT
  async mint(to: string, uri: string) {
    const { contract } = await this.init();
    const tx = await contract.mint(to, uri);
    await tx.wait();
    return tx.hash;
  },
  
  // Verify badge ownership
  async verify(id: string) {
    const { contract } = await this.init();
    const owner = await contract.ownerOf(id);
    const uri = await contract.tokenURI(id);
    return { owner, uri };
  },
  
  // Store badge metadata
  async store(data: any) {
    const { encrypted } = await fetch('/.netlify/functions/data-encrypt', {
      method: 'POST',
      body: JSON.stringify({ data })
    }).then(r => r.json());
    
    const { data: { id } } = await sb
      .from('badge_metadata')
      .insert({ data: encrypted })
      .select()
      .single();
      
    return `ipfs://${id}`;
  }
};