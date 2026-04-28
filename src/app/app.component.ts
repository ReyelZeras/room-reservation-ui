import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
  standalone: false // A MÁGICA ESTÁ AQUI: Evita o erro NG6008
})
export class AppComponent implements OnInit {

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.snapshot.data['title'] || 'RoomRes - Gestão de Salas';
      })
    ).subscribe((title: string) => {
      this.titleService.setTitle(title);
    });
  }
}
