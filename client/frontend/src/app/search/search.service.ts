import {Injectable} from '@angular/core';
import {IPositionCategory} from '../position_category/position_category.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import {IEducationLevel} from '../user/user.service';
import {ICompany} from '../company/service/company.service';
import {ILocation} from '../../common/service/location.service';
import {el} from "@angular/platform-browser/testing/src/browser_util";


export interface ISearch {
  search?: string;
  tags?: string;
  page?: number;
  categoryIds?: IPositionCategory[];
  companyId?: ICompany;
  minSalary?: number;
  maxSalary?: number;
  salaryType?: string;
  educationLevelIds?: IEducationLevel[];
  experience?: number;
  type?: string;
  locationIds?: ILocation[];
  jobNatureId?: number;
}


@Injectable()
export class searchService {
  constructor(private route: ActivatedRoute) {

  }

  addSelectedItem($event, data: any, selected: any, num: number): IPositionCategory[] {
    // clear child when selected parent
    _.map(selected,  (o, index)=> {
      let indexs = _.findIndex(selected, {parentId: data.id});
      if (indexs !== -1) {
        selected[indexs].selected = false;
        selected.splice(indexs, 1);
      }
    });

    if ($event.target.checked) {
      if (data.children) {
        data.children.forEach((value) => {
          value.selected = true;
        })
      } else {
        return;
      }
    } else {
      if (data.children) {
        data.children.forEach((value) => {
          value.selected = false;
        })
      } else {
        return;
      }
    }


    // push data
    let result = _.findIndex(selected, {id: data.id});
    if (result === -1) {
      if (selected.length < num) {
        data.selected = true;
        selected.push(data);
      }
    } else {
      data.selected = false;
      selected.splice(result, 1);
    }

    // clear parent when selected child
    let i = _.findIndex(selected, {id: data.parentId});
    if (i !== -1) {
      selected[i].selected = false;
      selected.splice(i, 1);
    }

    return selected;
  };
  searchType(type?: string) {
    switch (type) {
      case 'search':
        if (!_.isUndefined(this.route.params['tags'])) delete this.route.params['tags'];
        break;
      case 'tags':
        if (!_.isUndefined(this.route.params['search'])) delete this.route.params['search'];
        break;
    }
  }

}
