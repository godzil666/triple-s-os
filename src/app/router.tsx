import { Route, Routes } from 'react-router'
import { CustomerLayout } from './layouts/CustomerLayout'
import { PartnerLayout } from './layouts/PartnerLayout'
import { OwnerLayout } from './layouts/OwnerLayout'
import { PartnerPickerPage } from '../features/customer/PartnerPickerPage'
import { PlaceholderPage } from '../features/PlaceholderPage'
import { RequireRole } from '../auth/RequireRole'
import { LoginPage } from '../auth/LoginPage'
import { AccountsPage } from '../auth/AccountsPage'
import { HotspotPage } from '../features/hotspot/HotspotPage'
import { OwnerPages } from '../features/owner/OwnerPages'
import { AdminLayout } from './layouts/AdminLayout'
import { PackagesPage } from '../features/customer/PackagesPage'
import { CheckoutPage } from '../features/customer/CheckoutPage'
import { OrderPage } from '../features/customer/OrderPage'
import { PartnerPages } from '../features/partner/PartnerPages'

const ownerPages = [
 {path:'mitra',view:'partners'}, {path:'mitra/:id',view:'partner'}, {path:'paket',view:'packages'}, {path:'stok',view:'stock'}, {path:'transaksi',view:'transactions'}, {path:'transaksi/:id',view:'transaction'}, {path:'aktivitas',view:'audit'},
] as const
export function AppRoutes() {
  return <Routes>
    <Route element={<CustomerLayout />}>
      <Route index element={<PartnerPickerPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="wifi" element={<HotspotPage />} />
      <Route path="wifi/:siteId/login" element={<HotspotPage />} />
      <Route path="mitra/:id/paket" element={<PackagesPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="pesanan/:token" element={<OrderPage />} />
      <Route path="voucher/:token" element={<OrderPage voucherOnly />} />
      <Route path="*" element={<PlaceholderPage title="Halaman tidak ditemukan" description="Alamat ini tidak ada. Kembali ke pilihan mitra untuk melanjutkan pratinjau." stage={1} />} />
    </Route>
    <Route element={<RequireRole roles={['partner','owner']} />}><Route path="mitra-dashboard" element={<PartnerLayout />}>
      <Route index element={<PartnerPages view="overview" />} />
      <Route path="stok" element={<PartnerPages key="stock" view="stock"/>}/>
      <Route path="penjualan" element={<PartnerPages key="sales" view="sales"/>}/>
      <Route path="penjualan/:id" element={<PartnerPages key="detail" view="detail"/>}/>
      <Route path="bagi-hasil" element={<PartnerPages key="commission" view="commission"/>}/>
      <Route path="pengguna" element={<PartnerPages key="sessions" view="sessions"/>}/>
    </Route></Route>
    <Route element={<RequireRole roles={['admin','owner']} />}><Route path="admin" element={<AdminLayout />}>
      <Route index element={<OwnerPages view="overview" />} />
      {ownerPages.map(page => <Route key={page.path} path={page.path} element={<OwnerPages key={page.view} view={page.view} />} />)}
    </Route></Route>
    <Route element={<RequireRole roles={['owner']} />}><Route path="owner" element={<OwnerLayout />}>
      <Route index element={<OwnerPages view="overview" />} />
      <Route path="akun" element={<AccountsPage />} />
      {ownerPages.map(page=><Route key={page.path} path={page.path} element={<OwnerPages key={page.view} view={page.view} />} />)}
    </Route></Route>
  </Routes>
}

