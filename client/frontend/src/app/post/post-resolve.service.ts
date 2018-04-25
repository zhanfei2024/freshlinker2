import {Injectable}             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {IPost, PostService} from "./post.service";

@Injectable()
export class PostFindResolve implements Resolve<IPost> {
  constructor(private postService: PostService, private router: Router) {
  };

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    let id = route.params['id'];
    try {
      return await this.postService.find(id).toPromise();
    } catch (err) {
      this.router.navigate(['post/post-list']);
      return null;
    }

  }
}


