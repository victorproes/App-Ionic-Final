import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Article } from 'src/app/interfaces';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  // Referencia al componente IonInfiniteScroll para controlar la carga infinita
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll!: IonInfiniteScroll;

  // Lista de categorías de noticias
  public categories: string[] = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

  // Categoría seleccionada
  public selectedCategory: string = this.categories[0];

  // Lista de artículos de noticias
  public articles: Article[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    // Al inicializar el componente, cargar las principales noticias de la categoría seleccionada
    this.loadArticlesByCategory(this.selectedCategory);
  }

  // Método para cambiar de categoría
  segmentChanged(event: Event) {
    // Obtener la categoría seleccionada
    this.selectedCategory = (event as CustomEvent).detail.value;

    // Cargar las principales noticias de la categoría seleccionada
    this.loadArticlesByCategory(this.selectedCategory);
  }

  // Método para cargar más datos al alcanzar el final de la lista
  loadData() {
    // Obtener más artículos de la categoría seleccionada
    this.newsService.getTopHeadlinesByCategory(this.selectedCategory, true)
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

  // Método para cargar los artículos de noticias de una categoría específica
  private loadArticlesByCategory(category: string) {
    // Obtener las principales noticias de la categoría especificada
    this.newsService.getTopHeadlinesByCategory(category)
      .subscribe(articles => {
        // Actualizar la lista de artículos con los nuevos datos
        this.articles = articles;
      });
  }

}
