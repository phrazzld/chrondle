# TODO: Bitcoin Donation Feature

## Ship Today [45 minutes total]

### 1. Setup [5 minutes]

- [x] Run `pnpm add qrcode` to install QR code library (30KB, battle-tested)
- [x] Run `pnpm add -D @types/qrcode` for TypeScript support
- [x] Add `NEXT_PUBLIC_BITCOIN_ADDRESS=bc1qary6smwqm8at0vx5m4e6nxznpftrw8jzqe2u8x` to `.env.local`
- [x] Add `NEXT_PUBLIC_BITCOIN_ADDRESS=bc1q...` placeholder to `.env.example`

### 2. Create BitcoinModal Component [20 minutes]

- [x] Create file `/src/components/BitcoinModal.tsx`
- [x] Import required components:
  ```typescript
  import QRCode from "qrcode";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Copy, Check } from "lucide-react";
  ```
- [x] Add state for QR code data URL: `const [qrDataUrl, setQrDataUrl] = useState<string>('')`
- [x] Add state for copy feedback: `const [copied, setCopied] = useState(false)`
- [x] Get address from env: `const address = process.env.NEXT_PUBLIC_BITCOIN_ADDRESS || 'bc1qary6smwqm8at0vx5m4e6nxznpftrw8jzqe2u8x'`
- [x] Generate QR on mount:
  ```typescript
  useEffect(() => {
    QRCode.toDataURL(`bitcoin:${address}`)
      .then(setQrDataUrl)
      .catch(console.error);
  }, [address]);
  ```
- [x] Create Dialog with:
  - Title: "Donate Bitcoin"
  - QR image: `<img src={qrDataUrl} alt="Bitcoin QR" className="w-48 h-48 mx-auto" />`
  - Address text: `<code className="block text-xs break-all bg-muted p-2 rounded">{address}</code>`
- [x] Add copy button that:
  - Calls `navigator.clipboard.writeText(address)`
  - Shows "Copied!" for 2 seconds using setTimeout
  - Uses Check icon when copied, Copy icon otherwise
- [x] Export as: `export default function BitcoinModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void })`

### 3. Add to Footer [10 minutes]

- [x] Open `/src/components/Footer.tsx`
- [x] Import BitcoinModal: `import BitcoinModal from '@/components/BitcoinModal'`
- [x] Import Bitcoin icon: `import { Bitcoin } from 'lucide-react'`
- [x] Add modal state: `const [showBitcoin, setShowBitcoin] = useState(false)`
- [x] Change button container to have gap: `<div className="flex items-center justify-center gap-2">`
- [x] Add Bitcoin button after GitHub button:
  ```typescript
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowBitcoin(true)}
    className="text-muted-foreground hover:text-foreground gap-2 h-auto py-2"
  >
    <Bitcoin className="h-4 w-4" />
    <span className="hidden sm:inline text-sm">Donate</span>
  </Button>
  ```
- [x] Add modal before closing footer tag: `<BitcoinModal open={showBitcoin} onOpenChange={setShowBitcoin} />`

### 4. Test [10 minutes]

- [x] Run `pnpm dev` and verify button appears in footer
- [x] Click button and verify modal opens
- [x] Scan QR with phone wallet app (any Bitcoin wallet)
- [x] Test copy button and verify "Copied!" feedback works
- [x] Test Escape key closes modal
- [x] Test clicking outside closes modal
- [x] Check mobile view: button should show icon only
- [x] Check desktop view: button should show icon + "Donate" text

### 5. Deploy [5 minutes]

- [x] Run `pnpm build` to verify no build errors
- [x] Check bundle size didn't increase by more than 35KB
- [x] Commit with message: "feat: add Bitcoin donation button to footer" (done atomically)
- [x] Push to branch and create PR

---

## Done Criteria ✅

Working Bitcoin donation button that:

- Shows QR code that scans correctly
- Copies address to clipboard
- Works on mobile and desktop
- Adds < 35KB to bundle
- Zero custom crypto code

## NOT Doing (YAGNI)

- ❌ Custom Bitcoin address validation (we control the address)
- ❌ Custom QR code generation (use proven library)
- ❌ Lazy loading (footer is on every page)
- ❌ Multiple address types (one address is fine)
- ❌ BTCPay Server integration (until we need it)
- ❌ Lightning Network (until users ask)
- ❌ USD conversion display (unnecessary)
- ❌ Donation amounts (just address is enough)
- ❌ Unit tests (it's 50 lines of UI code)

---

## Future Iterations [If Needed]

### Phase 2: Lightning Support [When requested]

- [ ] Add BOLT11 invoice or LNURL support
- [ ] Add toggle between on-chain and Lightning

### Phase 3: BTCPay Server [If volume justifies]

- [ ] Create BTCPay account and store
- [ ] Add API integration for dynamic invoices
- [ ] Add payment confirmation flow

### Phase 4: Analytics [If donations happen]

- [ ] Track button clicks
- [ ] Track modal opens
- [ ] Track successful copies

---

_"Make it work, make it right, make it fast - in that order, and only if needed."_ - Kent Beck

The entire implementation is ~50 lines of code that ships in 45 minutes. No astronaut architecture needed.
