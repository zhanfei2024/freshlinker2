import {Injectable} from "@angular/core";


export interface IBread {
    title: string;
    router?: string;
}

@Injectable()
export class BreadcrumbService {
    public bread: IBread[];
    constructor() {
        this.bread = [
            {
                title: 'navbar.index',
                router: '/'
            }
        ];
    }

    get() {
        return this.bread;
    }

    set(article: IBread) {
        this.bread.push(article);
    }

    clear() {
        this.bread.splice(1, this.bread.length);
        return this.bread;
    }

}
