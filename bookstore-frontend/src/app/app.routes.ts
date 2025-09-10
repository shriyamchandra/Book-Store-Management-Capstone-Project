import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { BookDetailComponent } from './components/book-detail/book-detail';
import { CartComponent } from './components/cart/cart';
import { ProfileComponent } from './components/profile/profile';
import { OrdersComponent } from './components/orders/orders';

import { SearchResultsComponent } from './components/search-results/search-results';
import { AboutPageComponent } from './components/static/about/about';
import { ContactPageComponent } from './components/static/contact/contact';
import { BulkPurchasePageComponent } from './components/static/bulk-purchase/bulk-purchase';
import { ReturnsPageComponent } from './components/static/returns/returns';
import { PrivacyPageComponent } from './components/static/privacy/privacy';
import { QuickLinksPageComponent } from './components/static/quick-links/quick-links';
import { FacebookPageComponent } from './components/static/facebook/facebook';
import { InstagramPageComponent } from './components/static/instagram/instagram';
import { RefundPageComponent } from './components/static/refund/refund';
import { TermsPageComponent } from './components/static/terms/terms';
import { ShippingPageComponent } from './components/static/shipping/shipping';
import { PaymentPageComponent } from './components/checkout/payment';
import { PaymentSuccessComponent } from './components/checkout/success';

export const routes: Routes = [
  // Add a 'data' property to each route
  { path: '', component: BookListComponent, data: { animation: 'HomePage' } },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'register', component: RegisterComponent, data: { animation: 'RegisterPage' } },
  { path: 'books/:id', component: BookDetailComponent, data: { animation: 'DetailPage' } },
  { path: 'profile', component: ProfileComponent, data: { animation: 'ProfilePage' } },
  { path: 'orders', component: OrdersComponent, data: { animation: 'OrdersPage' } },
  { path: 'cart', component: CartComponent, data: { animation: 'CartPage' } },
  { path: 'search', component: SearchResultsComponent, data: { animation: 'SearchPage' } }
  ,
  { path: 'about', component: AboutPageComponent, data: { animation: 'AboutPage' } },
  { path: 'contact', component: ContactPageComponent, data: { animation: 'ContactPage' } },
  { path: 'bulk-purchase', component: BulkPurchasePageComponent, data: { animation: 'BulkPurchasePage' } },
  { path: 'returns', component: ReturnsPageComponent, data: { animation: 'ReturnsPage' } },
  { path: 'privacy', component: PrivacyPageComponent, data: { animation: 'PrivacyPage' } },
  { path: 'quick-links', component: QuickLinksPageComponent, data: { animation: 'QuickLinksPage' } },
  { path: 'facebook', component: FacebookPageComponent, data: { animation: 'FacebookPage' } },
  { path: 'instagram', component: InstagramPageComponent, data: { animation: 'InstagramPage' } }
  ,
  { path: 'refund', component: RefundPageComponent, data: { animation: 'RefundPage' } },
  { path: 'terms', component: TermsPageComponent, data: { animation: 'TermsPage' } },
  { path: 'shipping', component: ShippingPageComponent, data: { animation: 'ShippingPage' } }
  ,
  { path: 'checkout', component: PaymentPageComponent, data: { animation: 'CheckoutPage' } },
  { path: 'checkout/success', component: PaymentSuccessComponent, data: { animation: 'SuccessPage' } }
];
