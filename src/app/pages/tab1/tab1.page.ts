import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Article } from 'src/app/interfaces';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {

  // Referencia al componente IonInfiniteScroll para controlar la carga infinita
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll!: IonInfiniteScroll;

  // Arreglo para almacenar los artículos de noticias
  public articles: Article[] = [];

  // Variable para almacenar el valor de búsqueda
  public searchValue: string = '';

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    // Al inicializar el componente, obtener las principales noticias
    this.newsService.getTopHeadlines().subscribe(articles => {
      this.articles.push(...articles);
    });
  }

  // Método para cargar más datos al alcanzar el final de la lista
  loadData() {
    // Obtener más artículos de la categoría 'business'
    this.newsService.getTopHeadlinesByCategory('business', true)
      .subscribe(articles => {
        // Verificar si ya se han cargado todos los artículos disponibles
        if (articles.length === this.articles.length) {
          // Deshabilitar el componente IonInfiniteScroll si no hay más artículos para cargar
          this.infiniteScroll.disabled = true;
          return;
        }
        // Actualizar la lista de artículos con los nuevos datos
        this.articles = articles;
        // Completar la carga infinita
        this.infiniteScroll.complete();
      });
  }
}
