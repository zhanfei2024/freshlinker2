import {Injectable}             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Post, UserPostService} from "./user_article.service";

@Injectable()
export class PostFindResolve implements Resolve<Post> {

    constructor(private userPostService: UserPostService, private router: Router) {
    }

    async resolve(route: ActivatedRouteSnapshot): Promise<Post> {
        let id = route.params['id'];
        return await this.userPostService.find(id).toPromise();
    }
}
