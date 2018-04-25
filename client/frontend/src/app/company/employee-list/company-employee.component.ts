import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IEmployee, CompanyEmployeeService} from "../service/company.employee.service";
import {IFilter} from "../../position/position.service";
import * as _ from "lodash";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {IMeta} from "../../post/post.service";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './company-employee.component.html',
})
export class CompanyEmployeeComponent implements OnInit,AfterViewChecked {
  public companyId: string;
  public itemsByPage: number = 4;
  public employees: IEmployee[];
  public employeeIndex: number = 1;
  public loading: boolean = false;
  public isPass: boolean = false;
  public tableLoading: boolean = false;
  public listLoading: boolean = false;
  public tabLoading: boolean = false;
  public employeeStatus: any[] = [];
  public meta: IMeta = {pagination: {}};
  public filter: IFilter = {
    limit: 4,
    page: 1,
    status: '',
    search: ''
  };

  constructor(private companyEmployeeService: CompanyEmployeeService,
              private translate: TranslateService,
              private seoService: SeoService,
              private toasterService: ToasterService) {

  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.employee_list'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.employeeStatus = [
      {
        id: 1,
        name: 'enterprise.employee_list',
        status: 'pass'
      },
      {
        id: 2,
        name: 'enterprise.employees_to_join',
        status: 'pending'
      }
    ];
    this.employeeTab('pass',1);
  }

  employeeTab(status: string, id: number) {
    this.employeeIndex = id;
    this.employees = [];
    this.tabLoading = true;
    this.loading = true;
    this.filter.search = '';

    switch (id) {
      case 1:
        this.filter.status = 'pass';
        this.isPass = true;
        this.filter.page = 1;
        break;
      case 2:
        this.filter.status = 'pending';
        this.isPass = false;
        this.filter.page = 1;
        break;
    }

      this.tabLoading = false;


    this.readyEmployeeServer();

  }

  searchEmployee() {
    this.tabLoading = true;
    this.loading = true;
    this.employees = [];
    setTimeout(() => {
      this.tabLoading = false;
    }, 1000);
    this.readyEmployeeServer();
  }
  //加载分页
  async changePage(event: any) {
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.readyEmployeeServer();
  }

  async readyEmployeeServer(): Promise<any>{
    try{
      this.tableLoading = true;
      this.listLoading = true;
     let data = await this.companyEmployeeService.get(localStorage.getItem('company'), this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      this.employees = data.result;
      this.meta = data.meta;
      this.tableLoading = false;
      this.listLoading = false;
      this.loading = false;
    }catch (err){
      this.tableLoading = true;
      this.loading = false;
      this.listLoading = true;
    }
  }

  async destory(employeeId: string): Promise<any> {
    try {
      this.loading = true;
      await this.companyEmployeeService.destroy(localStorage.getItem('company'),employeeId).toPromise();
      let index = _.findIndex(this.employees, {id: employeeId});
      if (index !== -1) this.employees.splice(index, 1);
      this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
      this.employeeTab(status,1);
      this.loading = false;
    } catch (err) {}
  }


  async update(status:string,employeeId: string): Promise<any> {
    try {
      this.loading = true;
      let data = await this.companyEmployeeService.update(localStorage.getItem('company'),employeeId,{status:status}).toPromise();
      let index = _.findIndex(this.employees, {id: data.id});
      if (index !== -1) this.employees.splice(index, 1);
      this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
      this.employeeTab(status,1);
      this.loading = false;
    } catch (err) {}
  }


}
