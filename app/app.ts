import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {NewPaymentPage} from './pages/new-payment/new-payment';
import {ListPage} from './pages/list/list';
import {UserListPage} from './pages/userlist/userlist';
import {UserService} from './business/service';
import {SettingsPage} from './pages/settings/settings';

@Component({
  templateUrl: 'build/app.html',
  providers: [UserService]
})
class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = ListPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    private platform: Platform,
    private menu: MenuController
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: '缴费管理', component: ListPage },
      {title: "用户管理", component: UserListPage},
      { title: '设置', component:SettingsPage },
    ];
    //this.nav.push(NewPaymentPage);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if(page.component == NewPaymentPage){
      this.nav.setRoot(ListPage).then((data)=>{
        this.nav.push(NewPaymentPage);
      });
    }else{
      this.nav.setRoot(page.component);
    }
  }
}

ionicBootstrap(MyApp);
