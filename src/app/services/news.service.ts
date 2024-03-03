import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Article, ArticlesByCategoryAndPage, NewsResponse } from '../interfaces';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const apiKey = environment.apiKey;
const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private articlesByCategoryAndPage: ArticlesByCategoryAndPage = {};

  constructor(private http: HttpClient) { }

  // Realiza una solicitud HTTP genérica y devuelve un observable con la respuesta tipada.
  private executeQuery<T>(endpoint: string): Observable<T> {
    console.log('Peticion Http realizada');
    return this.http.get<T>(`${apiUrl}${endpoint}`, {
      params: {
        apiKey: apiKey,
        country: 'us',
      }
    });
  }

  // Obtiene las principales noticias y las devuelve como un observable de artículos.
  getTopHeadlines(): Observable<Article[]> {
    return this.getTopHeadlinesByCategory('business');
  }

  // Obtiene las principales noticias de una categoría y maneja la paginación.
  getTopHeadlinesByCategory(category: string, loadMore: boolean = false): Observable<Article[]> {
    if (loadMore) {
      return this.getArticlesByCategory(category);
    }
    if (this.articlesByCategoryAndPage[category]) {
      // Devuelve un observable con las noticias almacenadas en la memoria.
      
      return of(this.articlesByCategoryAndPage[category].articles);
    }
    // Realiza la solicitud HTTP para obtener noticias y manejar la paginación.
    return this.getArticlesByCategory(category);
  }

  // Obtiene las noticias de una categoría y maneja la paginación.
  private getArticlesByCategory(category: string): Observable<Article[]> {
    if (Object.keys(this.articlesByCategoryAndPage).includes(category)) {
      // Ya existe
    } else {
      // No existe, inicializa la categoría.
      this.articlesByCategoryAndPage[category] = {
        page: 0,
        articles: []
      };
    }

    const page = this.articlesByCategoryAndPage[category].page + 1;

    // Realiza la solicitud HTTP para obtener noticias y manejar la paginación.
    return this.executeQuery<NewsResponse>(`/top-headlines?category=${category}&page=${page}`)
      .pipe(
        map(({ articles }) => {
          console.log(articles);
          
          if (articles.length === 0) {
            // Si no hay más noticias, devuelve las noticias almacenadas.
            //Esto lo hago porque la api tiene 100 peticiones por dias para evitar repetir.
            return this.articlesByCategoryAndPage[category].articles;
          }

          // Actualiza la memoria con las nuevas noticias.
          this.articlesByCategoryAndPage[category] = {
            page: page,
            articles: [...this.articlesByCategoryAndPage[category].articles, ...articles]
          };

          console.log(this.articlesByCategoryAndPage[category].articles);

          // Devuelve las noticias actualizadas.
          return this.articlesByCategoryAndPage[category].articles;
        })
      );
  }
}