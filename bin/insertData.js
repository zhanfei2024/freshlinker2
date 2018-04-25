#!/usr/bin/env node

// ***************************************
// CORE INIT BEGIN
// ***************************************
// path setup
global.__base = __dirname + '/../';

// Config Init
let envPath = '.env';
if (process.env.NODE_ENV !== 'production')
  envPath = `.env.${process.env.NODE_ENV || 'development'}`;

require('dotenv').config({
  path: envPath
});

// ***************************************
// CORE INIT END
// ***************************************


// core
const debug = require('debug')('APP:QUEUE_BOOTSTRAP');
const logger = require(__base + 'modules/logger');

// library
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const request = require('superagent');


let data = [{
  email: 'info@freshlinker.com',
  name: 'freshlinker'
}, {
  email: 'dgdg38@yahoo.com.hk',
  name: '123123'
}, {
  email: 'Eugenia_Tse@abercrombie.com',
  name: 'abercrombie'
}, {
  email: 'amy.yim@belden.com',
  name: 'Belden'
}, {
  email: 'career@zensis.com',
  name: 'Zensis Limited'
}, {
  email: 'infoss@flexsystem.com',
  name: 'Flexsystem'
}, {
  email: 'Klaserhk2012@yahoo.com.hk',
  name: 'K Laser Technology'
}, {
  email: 'jobs.hkit@hm.com',
  name: 'Hennes Mauritz Limited'
}, {
  email: 'hrhk@appcogroup.asia',
  name: 'Appco HK Limited'
}, {
  email: 'cecilau@svsamford.com',
  name: 'SV Samford'
}, {
  email: 'cschan@cascube.com',
  name: 'Cascubelimited'
}, {
  email: 'Andrew@coltadvance.com',
  name: 'Coltadvance international'
}, {
  email: 'raymond@devcotech.com',
  name: 'Devco technology'
}, {
  email: 'info@easymarketing.hk',
  name: 'Easymarket limited'
}, {
  email: 'simon.tang@foodstepapp.com',
  name: 'Foodstep limited'
}, {
  email: 'lara@neogeno.com',
  name: 'Neogeno Technology'
}, {
  email: 'barrick@megaseen.com',
  name: 'Megaseen Limited'
}, {
  email: 'somethiung@self.com',
  name: 'some thing'
}, {
  email: 'abc@def.com',
  name: 'abc def'
}, {
  email: 'spaglobalgroup@gmail.com',
  name: 'SPA WAWA'
}, {
  email: 'info@lianatech.hk',
  name: 'liana technologies'
}, {
  email: 'cathy.mak@wspgroup.com.hk',
  name: 'WSP HONG KONG'
}, {
  email: 'fion.chu@innopage.com',
  name: 'Innopage Limited'
}, {
  email: 'rli226@bloomberg.net',
  name: 'Bloomberg'
}, {
  email: 'Elvia.hung@qbssystem.com',
  name: 'QBS'
}, {
  email: 'e_apply@oocl.com',
  name: 'OOCL'
}, {
  email: 'uberhklove@uber.com',
  name: 'UBER'
}, {
  email: 'info@eventxtra.com',
  name: 'Eventxtra'
}, {
  email: 'alphasights@freshlinker.com',
  name: 'Alpha sights'
}, {
  email: 'careers@goeasyship.com',
  name: 'Easy Ship'
}, {
  email: 'alanlee@atal.com.hk',
  name: 'ATAL'
}, {
  email: 'janicehou@wholechild.com.hk',
  name: 'Whole Child'
}, {
  email: 'bizzikidshk@gmail.com',
  name: 'Bizzi Kids'
}, {
  email: 'bellaytto@soleducation.hk',
  name: 'Sol Education Centre'
}, {
  email: 'osgh.ghr@goldenharvest.com',
  name: 'Golden harvest'
}, {
  email: 'sandy@technokey.com',
  name: 'Technokey'
}, {
  email: 'jrphr@jrpl.com',
  name: 'JRPL'
}, {
  email: 'hr.hk@infinitus-int.com',
  name: 'LKK Health Products Group'
}, {
  email: 'promotion@freshlinker.com',
  name: 'Marketing'
}, {
  email: 'darwinso@zetta.com.hk',
  name: 'Zetta'
}, {
  email: 'edwin@zensis.com',
  name: 'Zensis'
}, {
  email: 'shirley@powerelab.com',
  name: 'PowerElab'
}, {
  email: 'recruitment@ecvision.com',
  name: 'ecVision'
}, {
  email: 'jingwang@citinethk.com',
  name: 'Citinethk'
}, {
  email: 'sun.c@cyber-sys.com.hk',
  name: 'Cyber-sys'
}, {
  email: 'jadeite@weconvene.com',
  name: 'Weconvene'
}, {
  email: 'winnie@enanohealth.com',
  name: 'eNano Health Limited'
}, {
  email: 'info@kmatrixonline.com',
  name: 'K-Matrix Limited'
}, {
  email: 'helen.lam@infinitus-int.com',
  name: 'HeHa'
}, {
  email: 'admin@crossfire.hk',
  name: 'Crossfire'
}, {
  email: 'hr@paradigm2000.com',
  name: 'Paradigm Corporation'
}, {
  email: 'info@bookclass.net',
  name: 'Bookclass'
}, {
  email: 'brian@spacious.hk',
  name: 'Spacious'
}, {
  email: 'jessica.li@smartchinaholdings.com',
  name: 'Smart china holdings'
}, {
  email: 'hkcdasso@gmail.com',
  name: 'classroom 334'
}, {
  email: 'careers@tangomingo.com',
  name: 'Tangomingo'
}, {
  email: 'Kathy.wong@ef.com',
  name: 'Education First'
}, {
  email: 'IBM@freshlinker.com',
  name: 'IBM'
}, {
  email: 'hr@lafumahk.com.hk',
  name: 'LAFUMA'
}, {
  email: 'dennis.cheung@showmuse.so',
  name: 'Show muse'
}, {
  email: 'allie@amico.com.hk',
  name: 'Amico'
}, {
  email: 'someone@42la.bs',
  name: '42lab'
}, {
  email: 'demicheung@cloudpillar.com.hk',
  name: 'Cloud pillar'
}, {
  email: 'sindy.mok@madhead.com',
  name: 'Mad Head App Limited'
}, {
  email: 'chwong1@motherapp.com',
  name: 'Mother APP'
}, {
  email: 'cchow@kokomocapital.com',
  name: 'kokomo capital'
}, {
  email: 'maggiechan@astri.org',
  name: 'Astri'
}, {
  email: 'jobs@kfit.com',
  name: 'KFIT'
}, {
  email: 'amanda.tai@newworldtel.com',
  name: 'Newworldtel'
}, {
  email: 'jobs@oursky.com',
  name: 'OURSKY'
}, {
  email: 'cching@udcoled.com',
  name: 'Universal display corporation'
}, {
  email: 'info@carabela.cc',
  name: 'Carabela Limited'
}, {
  email: 'mehdi@getkawa.com',
  name: 'Kawa'
}, {
  email: 'tammy@krtmarketing.com',
  name: 'CH2M HILL'
}, {
  email: 'stella.alvarez@capco.com',
  name: 'Capco'
}, {
  email: 'jasmine.cheung@ipsos.com',
  name: 'Ipsos'
}, {
  email: 'cindy.ho@spectratech.com',
  name: 'Spectratech'
}, {
  email: 'may@asia-net.com.hk',
  name: 'Asia-net'
}, {
  email: 'venuslee@wharftt.com',
  name: 'Wharftt'
}, {
  email: 'anton.chan@smec.com',
  name: 'SMEC Asia Limited'
}, {
  email: 'nicole.ng@galaxyasia.net',
  name: 'Galaxy Asia Limited'
}, {
  email: 'info@sasamusicland.com',
  name: 'Sasa Music Land'
}, {
  email: 'ada@ada.com',
  name: '123123123'
}, {
  email: 'elliot@gaifongapp.com',
  name: 'Gaifong'
}, {
  email: 'a@gatecoin.com',
  name: 'Aurélien Menant'
}, {
  email: 'jobsdb@radicasys.com',
  name: 'Radica Systems Limited'
}, {
  email: 'thomsonwu@luenhinghong.com.hk',
  name: 'luen hing hong'
}, {
  email: 'alexliu@arpcl.com',
  name: 'Alex Liu'
}, {
  email: 'job@cbil.com.hk',
  name: 'Mandy Leung'
}, {
  email: 'hkrecruit@hkbn.net',
  name: 'HKBN'
}, {
  email: 'hk@telcobridges.com',
  name: 'Candy Chan'
}, {
  email: 'onlinestore.ivan@gmail.com',
  name: 'Chun Siu'
}, {
  email: 'careers@recruitexpress.com.hk',
  name: 'Jessica Cheng'
}, {
  email: 'jenniferfer1014@gmail.com',
  name: 'Jennifer Tang'
}, {
  email: 'sally.tong@lovespringtime.com',
  name: 'Spring time'
}, {
  email: 'recruitment_hk@jci.com',
  name: 'Johnson Controls'
}, {
  email: 'tlau994@gmail.com',
  name: 'Freshlinker'
}, {
  email: 'kimli@nami.org.hk',
  name: 'nami'
}, {
  email: 'careers@lamplight.me',
  name: 'Lamplight'
}, {
  email: 'fionawong@turbojet.com.hk',
  name: 'turbo jet'
}, {
  email: 'emilia.wong@concept-infinity.com',
  name: 'Concept Infinity'
}, {
  email: 'femi.oei@jos.com.hk',
  name: 'jardine onesolution'
}, {
  email: 'kathychiu@guruonline.com.hk',
  name: 'guru online'
}, {
  email: 'career@rollangle.com',
  name: 'RollAngle'
}, {
  email: 'cimmy@eventelite.com',
  name: 'event elite'
}, {
  email: 'stanley.tang@lexisnexis.com',
  name: 'lexisnexis'
}, {
  email: 'hr-hk@wesoft.com',
  name: 'Shirley Lam'
}, {
  email: 'hr.hongkong@sheraton.com',
  name: 'Sheraton'
}, {
  email: 'jasl.hr@jasg.com',
  name: 'Billy Lui'
}, {
  email: 'carol.li@parklandmusic.com.hk',
  name: 'Carol Li'
}, {
  email: 'margery.wong@pure-international.com',
  name: 'pure international'
}, {
  email: 'adahpy@shuion.com.hk',
  name: 'socam'
}, {
  email: 'Flora.Chan@AVNET.COM',
  name: 'avnet'
}, {
  email: 'hr@verity.com.hk',
  name: 'Verity Consulting Limited'
}, {
  email: 'hr@tshk.info',
  name: 'Sharon Lam'
}, {
  email: 'janice_cheung@hk.fujitsu.com',
  name: 'fujitsu'
}, {
  email: 'aing.fan@gpe-hkg.com',
  name: 'gp electronics'
}, {
  email: 'hongkong@tuspark.com',
  name: 'Tuspark'
}, {
  email: 'sally.leung@branco-life.com',
  name: 'Sally Leung'
}, {
  email: 'social@ambiclimate.com',
  name: 'Ambi Labs'
}, {
  email: 'jobs@popscout.co',
  name: 'Popscout'
}, {
  email: 'emailbock@gmail.com',
  name: 'Maggi HO'
}, {
  email: 'Cynthia.Cheung@robertwalters.com.hk',
  name: 'Robert Walters'
}, {
  email: 'cs.hk@dt-asia.com',
  name: 'DT-ASIA'
}, {
  email: 'kenny_cheung@aat.com.hk',
  name: 'aat'
}, {
  email: 'chris.man@marcopolohotels.com',
  name: 'marcopolo3358'
}, {
  email: 'lavie.ae@gmail.com',
  name: 'ignite'
}, {
  email: 'ceciliawu@finexis.com.hk',
  name: 'finexis'
}, {
  email: 'jobs.hkg@dksh.com',
  name: 'dksh'
}, {
  email: 'info@connexions.hk',
  name: 'Karen Cheung'
}, {
  email: 'Recruit.HK@ap.jll.com',
  name: 'Jones Lang LaSalle'
}, {
  email: 'michael.c@papercliphk.com',
  name: 'papercliphk'
}, {
  email: 'recruitment@time-medical.com',
  name: 'Time Medical Limited'
}, {
  email: 'recruitment@toryburch.com.hk',
  name: 'Tory Burch'
}, {
  email: 'patrick.ho@fourseasons.com',
  name: 'four seasons'
}, {
  email: 'kayho@eurekahk.net',
  name: 'eurekahk'
}, {
  email: 'mslsun@dairy-farm.com.hk',
  name: 'Mugen Sun'
}, {
  email: 'zoey_fong@ico.com.hk',
  name: 'ico'
}, {
  email: 'h2@ajcfood.com',
  name: 'AJC AJC'
}, {
  email: 'wangongrouphrd@gmail.com',
  name: 'wangonhr wangonhr'
}, {
  email: 'Miu.Lee@cosstores.com',
  name: 'COS'
}, {
  email: 'admin@rgf.com.hk',
  name: 'region fine'
}, {
  email: 'andy@geginfo.com',
  name: 'EVHK'
}, {
  email: 'mencyho@geneharbor.com.hk',
  name: 'geneharbor'
}, {
  email: 'okwnefokno@jkje.com',
  name: 'emiliww jwjeubb'
}, {
  email: 'flamber.int@gmail.com',
  name: 'Henneth Cheng'
}, {
  email: 'info@whub.hk',
  name: 'whub'
}, {
  email: 'Chase.Lam@EF.com',
  name: 'Education First'
}, {
  email: 'info@theballroom.com.hk',
  name: 'Ball Room'
}, {
  email: 'dickcheung@microtechinno.com',
  name: 'Dick CHEUNG'
}, {
  email: 'rebecca.lam@eservicesgroup.com',
  name: 'eservicesgroup'
}, {
  email: 'co@tomleemusic.com.hk',
  name: 'TOM LEE MUSIC'
}, {
  email: 'billy@morepd.com',
  name: 'billy lai'
}, {
  email: 'confidentialkln@apass.com.hk',
  name: 'Chikako KAMADA'
}, {
  email: 'tyip@greenpeace.org',
  name: 'Yip Kwan Yeung'
}, {
  email: 'hr@eventist.com',
  name: 'eventist'
}, {
  email: 'maggie.chu@easyvan.hk',
  name: 'Maggie CHU'
}, {
  email: 'marketing@cosmoproav.com',
  name: 'cosmoproav'
}, {
  email: 'eliza.lai@seamatch.com',
  name: 'Lai Eliza'
}, {
  email: 'raymond.ho@cccbullion.com',
  name: 'cccbullion'
}, {
  email: 'shirley@naturalscience.com.hk',
  name: 'naturalscience'
}, {
  email: 'pearl@happymonthly.com.hk',
  name: 'happymonthly'
}, {
  email: 'info@petlovehk.com',
  name: 'petlovehk'
}, {
  email: 'yoyo@snaptee.co',
  name: 'yoyo yiu'
}, {
  email: 'ella.chan@hyatt.com',
  name: 'hyattregency'
}, {
  email: 'hr@goldenmile.com',
  name: 'Holiday Inn'
}, {
  email: 'junperm.hk@adecco.com',
  name: 'Adecco Junperm'
}, {
  email: 'contact@yoyodyne-intl.com',
  name: 'Yoyodyne International'
}, {
  email: 'crystal.fung@goodman.com',
  name: 'Crystal Fung'
}, {
  email: 'astor@lumanlighting.com',
  name: 'lumanlighting'
}, {
  email: 'HR@JRT.COM.HK',
  name: 'CHAN Yau Lin'
}, {
  email: 'hr@vcareco.com',
  name: 'V Care Professional Group Limited'
}, {
  email: 'jaganath.swamy@gmail.com',
  name: 'Jaganath Swamy'
}, {
  email: 'david.ho@ssp.com.hk',
  name: 'ssp'
}, {
  email: 'kenneth@fsco.hk',
  name: 'Kenneth Kong'
}, {
  email: 'hr@clipperconcept.com',
  name: 'Clipper'
}, {
  email: 'wee.lee@quintessentially.com',
  name: 'quintessentially'
}, {
  email: 'elsie.yeung@airliquide.com',
  name: 'Elsie Yeung'
}, {
  email: 'hr@foodpanda.hk',
  name: 'Kalina Pang'
}, {
  email: 'yoyosiu@cloudpillar.com.hk',
  name: 'Yoyo Siu'
},
  {
    email: 'kelvinleung@idthk.com',
    name: 'oregon scientific'
  },
  {
    email: 'vivian.xiang@xpand.com.hk',
    name: 'Vivian Xiang'
  },
  {
    email: 'alvin.li@bgc-group.com',
    name: 'Alvin Li'
  }, {
    email: 'josephho@hket.com',
    name: 'Joseph Ho'
  }, {
    email: 'eddy@markglory.com',
    name: 'Siu Cheung Eddy'
  }, {
    email: 'hr@rice5.com',
    name: 'Rice 5 Rice 5'
  }, {
    email: '9gag@freshlinker.com',
    name: '9gag'
  }, {
    email: 'wallace@wbd101.com',
    name: 'wbd101'
  }, {
    email: 'stanley.ho@esfcentre.edu.hk',
    name: 'esf'
  }, {
    email: 'caroline.tam@digiphotoglobal.com',
    name: 'digiphoto'
  }, {
    email: 'info@loginedu.com',
    name: 'loginedu'
  }, {
    email: 'admin@compbrother.com',
    name: 'Compbrother'
  }, {
    email: 'viginkan@nwd.com.hk',
    name: 'New World Development'
  }, {
    email: 'abbeylinks@gmail.com',
    name: 'abbeylinks'
  }, {
    email: 'support@cworkx.com',
    name: 'Abbey Thomas'
  }, {
    email: 'info@millionjobshk.com',
    name: 'milionjobs'
  }, {
    email: 'doris.wong@sylinghim.com',
    name: 'investtab'
  }, {
    email: 'hazel.chan@hk.mcd.com',
    name: 'mcdonalds'
  }, {
    email: 'recruit@computershare.com.hk',
    name: 'computershare'
  }, {
    email: 'adrian@cornerstone.hk',
    name: 'Adrian Lai'
  }, {
    email: 'yukman@redso.com.hk',
    name: 'Yuk Man Chan'
  }, {
    email: 'kelvin@lovenaturalhk.com',
    name: 'love natural'
  }, {
    email: 'recruitment@chowtaifook.com',
    name: 'Chow Tai Fook Recruitment'
  }, {
    email: 'hr@taocheung.com.hk',
    name: 'Tao Heung Group Limited'
  }, {
    email: 'leon.lee@twyss.com',
    name: 'Twyss'
  }, {
    email: 'sam.c@glogame.com',
    name: 'Sam Chan'
  }, {
    email: 'ajnexus1@gmail.com',
    name: 'Alan Mak'
  }, {
    email: 'enquiry@alarice.com.hk',
    name: 'Alarice'
  }, {
    email: 'michel@environtechservices.com',
    name: 'environtechservices'
  }, {
    email: 'boscolam@alikeaudience.com',
    name: 'alikeaudience'
  }, {
    email: 'benoit.lambert@gmail.com',
    name: 'Intermed Asia'
  }, {
    email: 'jackytsoi09@gmail.com',
    name: 'Jacky Tsoi'
  }, {
    email: 'colin.ng@bluegic.com',
    name: 'lincogn technology'
  }, {
    email: 'edmund.lee@apptech.com.hk',
    name: 'apptech'
  }, {
    email: 'Joyce@9d.com.hk',
    name: '9d'
  }, {
    email: 'janicemak28@gmail.com',
    name: 'Janice Mak'
  }, {
    email: 'contact@nest.vc',
    name: 'Nest Admin'
  }, {
    email: 'chris.lloyd@leodanmedical.com',
    name: 'leodan'
  }, {
    email: 'macypang@hkgta.com',
    name: 'HKGTA'
  }, {
    email: 'alice.sk.lin@johnsonelectric.com',
    name: 'johnsonelectric'
  }, {
    email: 'ye@hkxinxing.com',
    name: 'HK XIN XING CORP. LTD'
  }, {
    email: 'signup@cozyhelp.com',
    name: 'David Lee'
  }, {
    email: 'recruithk@ifastfinancial.com',
    name: 'Recruit iFAST'
  }, {
    email: 'xania@jobdoh.com',
    name: 'JOBDOH'
  }, {
    email: 'Info@hk-faa.com',
    name: 'HK-FAA'
  }, {
    email: 'hello@missrunner.com',
    name: 'Tania Cheung'
  }, {
    email: 'info@healthylovedones.com',
    name: 'healthy loved ones'
  }, {
    email: 'info@grokenbioscience.com',
    name: 'Grover Cheung'
  }, {
    email: 'Global.Success.inquiry@gmail.com',
    name: 'Thirst For Thirst For'
  }, {
    email: 'fanny@kayue.hk',
    name: 'Fanny Wong'
  }, {
    email: 'mickey.yau@hktaximgt.com',
    name: 'hktaxi'
  }, {
    email: 'kenneth.kuo@appedu.co',
    name: 'Kuan-Chun Kuo'
  }, {
    email: 'jamie@lul.io',
    name: 'Jamie Chiu'
  }, {
    email: 'devuser@gmail.com',
    name: 'Dev freshlinker'
  }, {
    email: 'kimlo@hhlmail.com',
    name: 'hopewell'
  }, {
    email: 'info@latherap.com',
    name: 'La Therap Co., Ltd.'
  }, {
    email: 'pamela@axcessworldwide.com',
    name: 'Pamela Casequin'
  }, {
    email: 'antonia@guavapass.com',
    name: 'guavapass'
  }, {
    email: 'hr-hk@hnair.com',
    name: 'HNA(International)Company Limited'
  }, {
    email: 'susan@avalok.com.hk',
    name: 'bitex'
  }, {
    email: 'rebecca@ctrisksoln.com',
    name: 'Rebecca Chan'
  }, {
    email: 'sau00man@gmail.com',
    name: 'Sau Man Wong'
  }, {
    email: 'jake.ma@orbium.com',
    name: 'orbium'
  }, {
    email: 'talent@cosmosupplylab.com',
    name: 'cosmosupplylab'
  }, {
    email: 'idy.li@bgc-group.com',
    name: 'Sze Tai, Idy Li'
  }, {
    email: 'margaretkao@gmail.com',
    name: 'Margaret Davidge-Pitts'
  }, {
    email: 'recruitment@chicgroups.com',
    name: 'chic group'
  }, {
    email: 'crystalwong222@gmail.com',
    name: 'Crystal Wong'
  }, {
    email: 'Nicole.Lau@hk.nestle.com',
    name: 'nestle'
  }, {
    email: 'recruitment@sita.hk',
    name: 'Wendy Kwan'
  }, {
    email: 'winslow_ip@sats.com.sg',
    name: 'SATS'
  }, {
    email: 'atong@sierrawireless.com',
    name: 'Amy TONG'
  }, {
    email: 'hr.hk@comba-telecom.com',
    name: 'Sarah SO'
  }, {
    email: 'applyhk@fdmgroup.com',
    name: 'FDM Group'
  }, {
    email: 'conyho@superhomemedia.com',
    name: 'Ho Cony'
  }, {
    email: 'tracy.kk.huang@pccw.com',
    name: 'hkt'
  }, {
    email: 'dennis_y_lam@cathaypacific.com',
    name: 'Dennis Lam'
  }, {
    email: 'kathy.poon@callfixie.com',
    name: 'Kathy Poon'
  }, {
    email: 'felixfung@carbonik.com',
    name: 'Felix Fung'
  }, {
    email: 'alexislecomte@ubuduasia.com',
    name: 'Alexis Lecomte'
  }, {
    email: 'info@ccs-cpa.com',
    name: 'Kelly Suen'
  }, {
    email: 'sum.pang@kodingkingdom.com',
    name: 'Pang Cheuk Sum'
  }, {
    email: 'info@kodingkingdom.com',
    name: 'Koding Kingdom'
  }, {
    email: 'calvin.lau@boi.com.hk',
    name: 'Calvin Lau'
  }, {
    email: 'freshlinker@ysd.hk',
    name: 'ysd'
  }, {
    email: 'tomy@myicellar.com',
    name: 'Tomy Wu'
  }, {
    email: 'vincentwong@tul.com.hk',
    name: 'Vincent Wong'
  }, {
    email: 'dorothyso@dr-max.com.hk',
    name: 'drmax'
  }, {
    email: 'recruit@parentingheadline.com',
    name: 'parents'
  }, {
    email: 'apply_3@garden.com.hk',
    name: 'Garden Cheung'
  }, {
    email: 'trista.chan@neoderm.com.hk',
    name: 'hr@neoderm.com.hk'
  }, {
    email: 'chester@onehouse.hk',
    name: 'Chester Leung'
  }, {
    email: 'hr@ecrent.com',
    name: 'hr@ecrent.com'
  }, {
    email: 'ewan.ross@meltwater.com',
    name: 'Ewan Ross'
  }, {
    email: 'nandita@ga.co',
    name: 'Nandita Vyas'
  }, {
    email: 'recruit@thebeauty.hk',
    name: 'the beauty'
  }, {
    email: 'admin@canaelite.com',
    name: 'Joyce Wu'
  }, {
    email: 'juliang@cmi.chinamobile.com',
    name: 'Julia Ng'
  }, {
    email: 'admin@upsop.com',
    name: 'Dennis Cheung'
  }, {
    email: 'info@redkeycreative.com',
    name: 'Riz Fong'
  }, {
    email: 'aserich@morganmckinley.com',
    name: 'Morgan Mckinley'
  }, {
    email: 'hk@kkday.com',
    name: 'hk kkday'
  }, {
    email: 'hr@azl.com.hk',
    name: 'hr@azl.com.hk hr@azl.com.hk'
  }, {
    email: 'rafal@icstudio.io',
    name: 'Rafal Czerniawski'
  }, {
    email: 'andymok@hkfo.org',
    name: 'Tsz Yan Mok'
  }, {
    email: 'julie.wong@mobigator.com',
    name: 'Julie Wong'
  }, {
    email: 'david@laitinyam.com.hk',
    name: 'David Lai'
  }, {
    email: 'info@shineway-enterprise.com',
    name: 'Cheung Vincent'
  }, {
    email: 'info@internhongkong.com',
    name: 'Yiyan'
  }, {
    email: 'ryan@hkexcelteam.com',
    name: 'Ryan Chan'
  }, {
    email: 'recruit@hopewellholdings.com',
    name: 'Edward Chung'
  }, {
    email: 'bizsupport@pplesearch.com',
    name: 'Danielle Chan'
  }, {
    email: 'irisma@cmschina.com.hk',
    name: 'Ma Iris'
  }, {
    email: 'job@hk-belle.com',
    name: 'Belle Belle'
  }, {
    email: 'richardko@umadx.com',
    name: 'Richard Ko'
  }, {
    email: 'max.ng@wallsp.com',
    name: 'Max Ng'
  }, {
    email: 'douglasching@cmi.chinamobile.com',
    name: 'Douglas Ching'
  }, {
    email: 'kobe.lo@wallsp.com',
    name: 'Kobe Lo'
  }, {
    email: 'sky074662@gmail.com',
    name: 'Allen Ip'
  }, {
    email: 'winnie.kwok@wallsp.com',
    name: 'Winnie Kwok'
  }, {
    email: 'tchkhr@travelex.com.hk',
    name: 'Carol Chung'
  }, {
    email: 'hr@foxglobal.com',
    name: 'Vivian Au'
  }, {
    email: 'bettylee@spro.com.cn',
    name: 'Betty Lee'
  }, {
    email: 'recruit@broadway.com.hk',
    name: 'Broadway Photo Supply Limited Broadway Photo Supply Limited'
  }, {
    email: 'home11@live.hk',
    name: 'Ling Wong'
  }, {
    email: 'banny.chan@lumesse.com',
    name: 'Banny Chan'
  }, {
    email: 'hr_recruit@lawsgroup.com',
    name: 'Lawsgroup Lawsgroup'
  }, {
    email: 'ac@d-art.com.hk',
    name: 'Rainbow Ng'
  }, {
    email: 'ew.visionsuccess@gmail.com',
    name: 'EW Vision and Success Consultancy Company EW Vision and Success Consultancy Company'
  }, {
    email: 'Sharon.Leung@regus.com',
    name: 'Sharon Leung'
  }, {
    email: 'heidi@gsh.com.hk',
    name: 'Heidi Chow'
  }, {
    email: 'careers@astri.org',
    name: 'astri astri'
  }, {
    email: 'Michelle_nt_lau@manulife.com.hk',
    name: 'Michelle Lau'
  }, {
    email: 'dennywan@beacon.com.hk',
    name: 'Denny Wan'
  }, {
    email: 'jaywalker4@gmail.com',
    name: 'Tim Yuen'
  }, {
    email: 'sarah.chan@seamatch.com',
    name: 'seamatch asia'
  }, {
    email: 'claudia.hy.chow@pccw.com',
    name: 'Claudia Chow'
  }, {
    email: 'yan@remitla.com',
    name: 'yan leung'
  }, {
    email: 'janice.mak@group-miki.com',
    name: 'Janice Mak'
  }, {
    email: 'Agnes.Ip@shinewing.hk',
    name: 'Ip Agnes'
  }, {
    email: 'chrischrismomo@gmail.com',
    name: 'chris Wong'
  }, {
    email: 'tonigieuw@aquissearch.com',
    name: 'Toni Gieuw'
  }, {
    email: 'may@vgt.com.hk',
    name: 'Mei Yee Cheung'
  }, {
    email: 'hello@quikspaces.com',
    name: 'Jacky Lo'
  }, {
    email: 'JacksonChow@eurofins.com',
    name: 'Jackson Chow'
  }, {
    email: 'hr3@hket.com',
    name: 'Carrie Chan'
  }, {
    email: 'william@aptitudeasia.com',
    name: 'William Chan'
  }, {
    email: 'h6771-hr1@accor.com',
    name: 'Junie Li'
  }, {
    email: 'info@hkpickup.com',
    name: 'Allan Wong'
  }, {
    email: 'terence.tsang@esvcnet.com',
    name: 'Terence Tsang'
  }, {
    email: 'career@missrunner.com',
    name: 'Tania Cheung'
  }, {
    email: 'johnny.zhang@jmpartner.com.hk',
    name: 'Johnny Zhang'
  }, {
    email: 'katherinechow@recruitfirst.com.hk',
    name: 'Chow Katherine'
  }, {
    email: 'winus.wong@wallsp.com',
    name: 'Winus Wong'
  }, {
    email: 'michelle.man@pizzaexpress.hk',
    name: 'Michelle Man'
  }, {
    email: 'wen@ananflow.com',
    name: 'Wen Huang'
  }, {
    email: 'pinkytang@ody-capital.com',
    name: 'Pinky Tang'
  }, {
    email: 'hello@thewave.com.hk',
    name: 'Felix Wong'
  }, {
    email: 'kiwi.hu@visionamed.com',
    name: 'kiwi hu'
  }, {
    email: 'resume@andrewfound.com',
    name: 'Kacelyn Ip'
  }, {
    email: 'jacky@tfhk.org',
    name: 'Teach4HK'
  }, {
    email: 'raymond.lee@icw.io',
    name: 'Raymond Lee'
  }, {
    email: 'eva.cheng@ourhkfoundation.com',
    name: 'Our Hong Kong Foundation'
  }, {
    email: 'ckei@yahoo-inc.com',
    name: 'Yahoo!'
  }, {
    email: 'selma.lui@hm.com',
    name: 'H&M IT department'
  }, {
    email: 'debbie.kwok@lawsgroup.com',
    name: 'lawsgroup'
  }, {
    email: 'wendy.kwan@pizzaexpress.hk',
    name: 'Pizza Express'
  }, {
    email: 'admin@canaelite.com',
    name: 'Cana'
  }, {
    email: 'karl.li@mewme.com',
    name: 'MewMe'
  }, {
    email: 'aau@acesobee.com',
    name: 'Acesobee Limited'
  }, {
    email: 'data@printact.co',
    name: 'Printact'
  }, {
    email: 'elai@reconnect.org.hk',
    name: 'ReConnect Environmental Institute'
  }, {
    email: 'harris.sun@arkvida.com',
    name: 'Arkvida Limited'
  }, {
    email: 'hanley@aerate.co',
    name: 'Aerate'
  }, {
    email: 'rebecca_l@tunghinghk.com',
    name: 'Tung Hing Enterprise'
  }, {
    email: 'kindson@c4innovative.com.hk',
    name: 'C4 Innovative Technology Company Limited'
  }, {
    email: 'info@iseemobile.com',
    name: 'iSEE Mobile Apps'
  }, {
    email: 'davidlam@wf-group.com.hk',
    name: 'Wan Fung Group'
  }, {
    email: 'samuel.wan@moleculez.co',
    name: 'StockFlash'
  }, {
    email: 'kevincheung@kryptos.tech',
    name: 'Kryptos'
  }, {
    email: 'tonny.wong@fashionflagship.hk',
    name: 'CHIC#AG'
  }, {
    email: 'yuk@apostrophes.co',
    name: 'Apostrophe\'s'
  }, {
    email: 'ming.kong@zoho.com',
    name: 'HomeTaste'
  }, {
    email: 'gary.wong@kingcitytech.com',
    name: 'King City'
  }, {
    email: 'charleshung@live.hk',
    name: 'Sun Shine Investments'
  }, {
    email: 'info@getsby.io',
    name: 'Getsby'
  }, {
    email: 'brunocai@artworkanalysis.com',
    name: 'Artwork Analysis'
  }, {
    email: 'sswingchan2@gmail.com',
    name: 'Smartake Limited'
  }, {
    email: 'hugomak@noiselimited.com',
    name: 'Noise Limited'
  }, {
    email: 'perry.chan@cbec-king.com',
    name: 'CBECK'
  }, {
    email: 'kimature1@gmail.com',
    name: 'Kimature'
  }, {
    email: 'fonglau@fung1937.com',
    name: 'Marvel Sun Enterprises Limited'
  }, {
    email: 'king@o2osolution.com',
    name: 'O2O Vending Solution Co,. LTD'
  }, {
    email: 'steven.ykk@citytone.com.hk',
    name: 'CityTone'
  }, {
    email: 'founder.alexchoi@hongkongfans.org',
    name: 'Hong Kong Fans'
  }, {
    email: 'dennis@growpostmag.com',
    name: 'growPOST'
  }, {
    email: 'felix.wong@thewave.com.hk',
    name: 'The Wave'
  }, {
    email: 'crystalfong.hr@broadway.com.hk',
    name: 'Broadway'
  }, {
    email: 'venusleung@ifastfinancial.com',
    name: 'iFAST'
  }, {
    email: 'Janet.Law@fdmgroup.com',
    name: 'FDM Group'
  }, {
    email: 'vickywong@alibaba-inc.com',
    name: 'Alibaba'
  }, {
    email: 'vivian.lai@ga.co',
    name: 'General Assembly'
  }, {
    email: 'simontam@chicgroups.com',
    name: 'Chic Group International (HK) Company Limited'
  }, {
    email: 'pollyau@hk01.com',
    name: '香港01'
  }, {
    email: 'philipho@latherap.com',
    name: 'latherap'
  }, {
    email: 'tracy.kk.huang@pccw.com',
    name: 'HKT'
  }, {
    email: 'mickey.yau@hktaximgt.com',
    name: 'HKTaxi App Limited'
  }, {
    email: 'pollywan@hkc.net',
    name: 'Hong Kong Communication Co., Ltd - HKC'
  }, {
    email: 'richard.au@healthylovedones.com',
    name: 'healthy loved ones'
  }, {
    email: 'stanleyhui888@gmail.com',
    name: 'hk-faa'
  }, {
    email: 'monique_wong@infocan.net',
    name: 'Infocan Training Limited'
  }, {
    email: 'hrdept@hkg.fujixerox.com',
    name: 'FUJI XEROX'
  }, {
    email: 'johnwong@sunevision.com',
    name: 'SUNeVision Holdings Ltd.'
  }, {
    email: 'lina.alariceltd@gmail.com',
    name: 'Alarice'
  }, {
    email: 'hr@chechk.com',
    name: 'China harbour Engineering'
  }, {
    email: 'sanny.ng@lr.org',
    name: 'lloyd\'s register'
  }, {
    email: 'ryanchanwaiyan@gmail.com',
    name: 'HKExcel'
  }, {
    email: 'Peggy.Leung@hk.mcd.com',
    name: 'McDonald’s ®'
  }, {
    email: 'tina.sze@digiphotoglobal.com',
    name: 'Digiphoto Entertainment Imaging'
  }, {
    email: 'info@babyboom.com.hk',
    name: 'BABYBOOM LEARNING COMPANY LIMITED'
  }, {
    email: 'info@mindcraftershk.com',
    name: 'Mindcraftershk'
  }, {
    email: 'info@organiclearning.hk',
    name: 'Organic Learning 有機教育'
  }, {
    email: 'carriechan@hket.com',
    name: 'HKET'
  },
  {
    email: 'lwong@teslamotors.com',
    name: 'Tesla Motor'
  }, {
    email: 'eileenyip@peddergroup.com',
    name: 'Pedder Group'
  }, {
    email: 'js@gudparents.com',
    name: 'The Kiddo'
  }, {
    email: 'hr_recruitment@wanchung.com',
    name: 'Wan Chung'
  }, {
    email: 'admin@vcareco.com',
    name: 'V Care Professional Group Limited'
  }, {
    email: 'karen.siu@seamatch.com',
    name: 'seamatch'
  }, {
    email: 'karen.lo@ul.com',
    name: 'UL International'
  }, {
    email: 'linda.lau@forida.com.hk',
    name: 'Forida'
  }, {
    email: 'ada.so@goldenmile.com',
    name: 'holiday inn golden mile'
  }, {
    email: 'joshua.tsui@tomleemusic.com.hk',
    name: 'Tom Lee Music'
  }, {
    email: 'pearl@naturalscience.com.hk',
    name: 'Natural Science Ltd.'
  }, {
    email: 'jason@utcip.hk',
    name: 'UTC Intellectual'
  }, {
    email: 'shirlychan@lawzelite.com',
    name: 'Lawz Elite Education'
  }, {
    email: 'es.hrserviceschk@unileverservices.com',
    name: 'Unilever'
  }, {
    email: 'jun.lam@clipperconcept.com',
    name: 'Clipper'
  }, {
    email: 'amy.tang@protiviti.com',
    name: 'protiviti'
  }, {
    email: 'edward@hkexcel.com',
    name: 'Flamber International'
  }, {
    email: 'vinccihui@hhlmail.com',
    name: 'Hopewell Holdings Limited'
  }, {
    email: 'deborah.wai@thegaragesociety.com',
    name: 'The Garage Socirty'
  }, {
    email: 'carroll.chu@aqua.com.hk',
    name: 'Aqua Restaurant'
  }, {
    email: 'stephen.yc.lee@wangon.com',
    name: 'WANG ON GROUP'
  }, {
    email: 'bcheng@ajcfood.com',
    name: 'AJC Food'
  }, {
    email: 'joinus@dairy-farm.com.hk',
    name: 'Mannings (Under Dairy Farm)'
  }, {
    email: 'louis.chong@metrojet.com',
    name: 'Metrojet'
  }, {
    email: 'florencelam@finexis.com.hk',
    name: 'Finexis'
  }, {
    email: 'michael.c@papercliphk.com',
    name: 'PaperClip'
  }, {
    email: 'Ellie@eccoachinghk.com',
    name: 'EC coaching'
  }, {
    email: 'romain@popscout.co',
    name: 'Popscout'
  }, {
    email: 'kristian@tuspark.com',
    name: 'Tuspark'
  }, {
    email: 'chelsea.lee@hays.com.hk',
    name: 'HAYS'
  }, {
    email: 'shirley.lam@wesoft.com',
    name: 'WE SOFTWARE LIMITED'
  }, {
    email: 'alex.chun@neoderm.com.hk',
    name: 'Neo Derm (HK) Ltd'
  }, {
    email: 'sarah.yau@rollangle.com',
    name: 'Rollangle'
  }, {
    email: 'holly.chung@concept-infinity.com',
    name: 'concept infinity'
  }, {
    email: 'emilie.murcy@lamplight.me',
    name: 'Lamplight'
  }, {
    email: 'julian@ambiclimate.com',
    name: 'Ambi Labs'
  }, {
    email: 'Femi.owi@JTHGroup.com',
    name: 'The Jardine Onesolution'
  }, {
    email: 'lidy_cai@cathaypacific.com',
    name: 'Cathay Pacific'
  }, {
    email: 'charles.wong@cosmosupplylab.com',
    name: 'Cosmo Supply Lab'
  }, {
    email: 'kenneth.kam@grokenbioscience.com',
    name: 'groken bioscience'
  }, {
    email: 'eva.chiu@mergermarket.com',
    name: 'Debtwire'
  }, {
    email: 'vinci.wong@radicasys.com',
    name: 'Radica Systems Limited'
  }, {
    email: 'spawawahk@gmail.com',
    name: 'SPA WAWA'
  }, {
    email: 'FrankieFung@umadx.com',
    name: 'Umadx'
  }, {
    email: 'ben.ho@horizongroup.com.hk',
    name: 'Horizon (HK) -Accounting firm'
  }, {
    email: 'stephaniewongsf@dbs.com',
    name: 'DBS'
  }, {
    email: 'ida@oursky.com',
    name: 'OURSKY'
  }, {
    email: 'audra@kfit.com',
    name: 'KFIT'
  }, {
    email: 'recruit@beyondlearninghk.com',
    name: 'Beyond Learning Association'
  }, {
    email: 'ellie.eflesher@hnair.com',
    name: 'HNA International'
  }, {
    email: 'keith.tsa@apptask.com',
    name: 'Apptask-meeting'
  }, {
    email: 'anita.fan@oceanpark.com.hk',
    name: 'Ocean Park'
  }, {
    email: 'steven.wong@42la.bs',
    name: '42lab'
  }, {
    email: 'hr3@amorepacific.com.hk',
    name: 'sulwhasoo , amorepacific'
  }, {
    email: 'gpobox@hkland.com',
    name: 'Hong Kong Land'
  }, {
    email: 'cherryleung@guruonline.com.hk',
    name: 'Guru Online '
  }, {
    email: 'flora.chan@avnet.com',
    name: 'Avnet'
  }, {
    email: 'dohn.li@ssp.com.hk',
    name: 'SSP The Food Travel Experts'
  }, {
    email: 'hq@hkfyg.org.hk',
    name: 'HKFYG 香港青年協會'
  }, {
    email: 'veronicang@taoheung.com.hk',
    name: 'Tao Heung Group'
  }, {
    email: 'blairc@hk1.ibm.com',
    name: 'IBM'
  }, {
    email: 'kathy.wong@ef.com',
    name: 'Education First - Now account efmt'
  }, {
    email: 'ruby.wong@hkg.sun-cargo.com',
    name: 'Sun Cargo International Ltd'
  }, {
    email: 'allison@nest.vc',
    name: 'Nest'
  }, {
    email: 'simon.loong@welab.co',
    name: 'Welab'
  }, {
    email: 'david@variab.ly',
    name: 'variab.ly'
  }, {
    email: 'Noel.Lau@bahpartners.com',
    name: 'Bah partners limited'
  }, {
    email: 'alanwu@hhlmail.com',
    name: 'Hopewell Hospitality Management Limited'
  }, {
    email: 'alex.lee@asmpt.com.hk',
    name: 'ASM Pacific Technology'
  }, {
    email: 'Eyeung@toryburch.com.hk',
    name: 'Tory Burch'
  }, {
    email: 'david.li@tangomingo.com',
    name: 'Tangomingo'
  }, {
    email: 'reuben@goeasyship.com',
    name: 'Easy Ship'
  }, {
    email: 'wendy@passk.it',
    name: 'Passkit'
  }, {
    email: 'angusluk@eventxtra.com',
    name: 'Eventxtra'
  }, {
    email: 'radek@weconvene.com',
    name: 'Weconvene'
  }, {
    email: 'vincent.wong@chandlermacleod.com',
    name: 'Chandler Macleod'
  }, {
    email: 'guy@drake.com.hk',
    name: 'Drake'
  }, {
    email: 'wendyfung@citicpacific.com',
    name: 'Citic Pacific'
  }, {
    email: 'calvin.ma@uber.com',
    name: 'UBER'
  }, {
    email: 'charityhon@ecvision.com',
    name: 'ecVision'
  }, {
    email: 'clai@lacoste.com',
    name: 'Lacoste'
  }, {
    email: 'eliza.fan@hk.pico.com',
    name: 'Pico'
  }, {
    email: 'simon.mak@regionfine.com.hk',
    name: 'Region Fine (HK) Ltd.'
  }, {
    email: 'hr@rec-eng.com',
    name: 'REC Engineering Company Limited'
  }, {
    email: 'admin@raising.com.hk',
    name: 'Raising Engineering Limited'
  }, {
    email: 'kelvin.kuo@tmkal.com',
    name: 'LMM Consulting Engineers Limited'
  }, {
    email: 'recruitment@likkai.com.hk',
    name: 'Lik Kai Engineering Co., Ltd.'
  }, {
    email: 'akwong02@163.com',
    name: 'Kwan On Construction Co. Ltd.'
  }, {
    email: 'eddieso@krueger.com.hk',
    name: 'Krueger Engineering (Asia) Ltd.'
  }, {
    email: 'sceehr@scee.com.hk',
    name: 'Kin Wing Engineering Company Limited'
  }, {
    email: 'jenny.lam@buildking.hk',
    name: 'Kaden Construction Limited'
  }, {
    email: 'wilson.wc.or@jci.com',
    name: 'Johnson Controls Hong Kong Limited'
  }, {
    email: 'personnel@skyforce.com.hk',
    name: 'Skyforce Engineering Limited'
  }, {
    email: 'office@siuyinwai.com',
    name: 'SIU YIN WAI & ASSOCIATES LIMITED'
  }, {
    email: 'jmk@jmk.com.hk',
    name: 'JMK Consulting Engineers Limited'
  }, {
    email: 'jmihr@jmi.com.hk',
    name: 'Jing Mei Automotive Limited'
  }, {
    email: 'info@ispl.com.hk',
    name: 'ISPL Consulting Limited'
  }, {
    email: 'annychan@shunhinggroup.com',
    name: 'Shun Hing Engineering Contracting Co. Ltd.'
  }, {
    email: 'flora@shinryo.com.hk',
    name: 'SHINRYO (HONG KONG) LIMITED'
  }, {
    email: 'hr@topexpress.com.hk',
    name: 'Topexpress '
  }, {
    email: 'connie.cheung@adidas-group.com',
    name: 'Adidas'
  }, {
    email: 'jason.x.lau@oracle.com',
    name: 'oracle'
  }, {
    email: 'jeshih@linkedin.com',
    name: 'Linkedin'
  }, {
    email: 'flora.cheung@oocl.com',
    name: 'OOCL'
  }, {
    email: 'ada@metasystems-asia.com',
    name: 'Metasystems Asia'
  }, {
    email: 'tina@form-world.com',
    name: '香港希駿軟件'
  }, {
    email: 'info@hns-hk.com',
    name: '香港通恒電子有限公司'
  }, {
    email: 'bobo@easttech.com.hk',
    name: '東科技網頁設計'
  }, {
    email: 'info@glamm.com.hk',
    name: 'Glamm'
  }, {
    email: 'loretta@tphoton.com',
    name: '三仁光學製造'
  }, {
    email: 'geng@eastspider.com',
    name: '歷翔科技'
  }, {
    email: 'admin@sengital.com',
    name: '港科研有限公司'
  }, {
    email: 'canny.fong@vde.com',
    name: '威第一環球服務'
  }, {
    email: 'gladys_liu@kodec.com',
    name: '科達創展'
  }, {
    email: 'melanie.dy@xinyiglass.com.hk',
    name: '信義集團'
  }, {
    email: 'info.rshk@rohde-schwarz.com',
    name: 'Rohde & Schwarz'
  }, {
    email: 'kiki.tong@haeco.com',
    name: '香港飛機工程'
  }, {
    email: 'keith.chan@uniqlo.com.hk',
    name: 'Uniqlo'
  }, {
    email: 'chakkitsui@lifung.com',
    name: 'li fung '
  }, {
    email: 'hk.hr@gibson.com',
    name: 'Gibson'
  }, {
    email: 'idthk@idthk.com',
    name: 'IDT / Oregon Scientific'
  }, {
    email: 'recruit.hk@atkinsglobal.com',
    name: 'Atkins call on 20/5'
  }, {
    email: 'ktseng@group.com',
    name: 'Groupon HK'
  }, {
    email: 'frances.luk@scmp.com',
    name: 'scmp'
  }, {
    email: 'ghrhk@jebsen.com',
    name: 'Jebsen Consumer Products Company Limited'
  }, {
    email: 'rclperadm@hknet.com',
    name: 'RCL Semiconductors Limited'
  }, {
    email: 'kmcheung@atnt.biz',
    name: 'PROCESS AUTOMATION INTERNATIONAL LIMITED'
  }, {
    email: 'marketing@meyer-mal.com',
    name: 'MEYER ALUMINIUM LIMITED'
  }, {
    email: 'tshk@jec.com',
    name: 'TYS Limited (JEC)'
  }, {
    email: 'info@tqm.com.hk',
    name: 'TQM Consultants Co. Ltd.'
  }, {
    email: 'angee.sham@tfh.com.hk',
    name: 'TFH Manufacturing Company Limited'
  }, {
    email: 'info@petros.com.hk',
    name: 'Petros Consulting Engineers Ltd.'
  },
  {
    email: 'thomsonwu@luenhinghong.com.hk ',
    name: 'Luen Hing Hong Buildings Materials Limited 聯興行建築材料有限公司'
  }, {
    email: 'wnkn@hitachi-elev.com.hk',
    name: 'HITACHI ELEVATOR ENGINEERING COMPANY (HONG KONG) LIMITED'
  }, {
    email: 'kathy.fok@renaissancehotels.com',
    name: 'Renasissance Harbour View Hotel Hong Kong'
  }, {
    email: 'leo.ng@galaxyasia.net',
    name: 'Galaxy Asia Limited'
  }, {
    email: 'info@timeless.com.hk',
    name: 'Timeless Software Limited'
  }, {
    email: 'recruit@bbpos.com',
    name: 'BBPOS Limited'
  }, {
    email: 'info@rf.com.hk',
    name: 'RADIO FREQUENCY ENGINEERING LIMITED'
  }, {
    email: 'enquiry@nifco.com',
    name: 'NIFCO (HK) LIMITED'
  }, {
    email: 'recruitment@suntechgroup.com',
    name: 'SUN-TECH INTERNATIONAL GROUP LIMITED'
  }, {
    email: 'daniel@at-creative.com',
    name: 'ARTECH CREATIVE PRODUCTION AND PRINTING LIMITED'
  }, {
    email: 'personnel@oceanfax.com',
    name: 'Oceanx Technology Limited'
  }, {
    email: 'andychan@smarksgroup.com',
    name: 'Smarks Group Company Limited'
  }, {
    email: 'davidk@kitesystems.com',
    name: 'KITE SYSTEMS LIMITED'
  }, {
    email: 'jobs@cherrypicks.com',
    name: 'Cherrypicks Limited'
  }, {
    email: 'mike.leung@tech-trans.com',
    name: 'Tech-Trans Telecom Ltd'
  }, {
    email: 'james@tforcetech.com',
    name: 'TForce Technologies Limited'
  }, {
    email: 'hk-hr@citytone.com.hk',
    name: 'Citytone technology'
  }, {
    email: 'info@etech-city.com',
    name: 'ETECH PLUS INTERNATIONAL LIMITED'
  }, {
    email: 'talentmanagement@eservicesgroup.net',
    name: 'E-Services Group Limited'
  }, {
    email: 'claudia.chow@hkbn.com.hk',
    name: 'HKBN'
  }, {
    email: 'info@thequest.hk',
    name: 'Quest RPG Mission Game'
  }, {
    email: 'recruit2@swireproperties.com',
    name: 'Swire Properties Management Limited'
  }, {
    email: 'milly.tai@towngas.com',
    name: 'Hong Kong and China Gas Company Limited'
  }, {
    email: 'vla@vla.hk',
    name: 'Victor Li & Associates Ltd.'
  }, {
    email: 'admin@wtchan.com.hk',
    name: 'W T Chan & Associates Limited'
  }, {
    email: 'tdprappt@td.gov.hk',
    name: '運輸署'
  }, {
    email: 'koo_wy@csd.gov.hk',
    name: '懲教署 Correctional Services Department'
  }, {
    email: 'oc-appt-2-p-a@police.gov.hk',
    name: '香港警務處'
  }, {
    email: 'wingchan@muji.com.hk',
    name: 'MUJI'
  }, {
    email: 'joeycylau@hangseng.com',
    name: 'Hang seng bank'
  }, {
    email: 'jeffrey.lam@gpe-hkg.com',
    name: 'GP Electronics (HK) Limited'
  }, {
    email: 'gia.sun@cbre.com.hk',
    name: 'CBRE'
  }, {
    email: 'wym438@ha.org.hk',
    name: 'Hospital Authority'
  }, {
    email: 'hr.hk@infinitus-int.com',
    name: 'LKK Health Products Group'
  }, {
    email: 'Cynthia.Cheung@robertwalters.com.hk',
    name: 'Robert Walters'
  }, {
    email: 'Becky.ps-wong@clts.com',
    name: 'clts'
  }, {
    email: 'recruit_amoy@amoy.ajinomoto.com',
    name: 'Amoy Food Limited'
  }, {
    email: 'recruit@nissinfoods.com.hk',
    name: 'Miracle Foods Company Limited'
  }, {
    email: 'wendy.man@pfizer.com',
    name: 'Pfizer'
  }, {
    email: 'beatrice.wh.leung@marsh.com',
    name: 'Marsh'
  }, {
    email: 'alice.chau@hyderconsulting.com',
    name: 'Hyder Consultincy'
  }, {
    email: 'askus@hkexpress.com',
    name: 'HK Express'
  }, {
    email: 'Sabrina.ip@nielsen.com',
    name: 'Nielsen'
  }, {
    email: 'corieng@jsshk.com',
    name: 'Swire Travel'
  }, {
    email: 'tanco@netvigator.com',
    name: 'CHINESE MANUFACTURERS\' ASSOCIATION OF HONG KONG -THE-'
  }, {
    email: 'maisie@wasabic.com.hk',
    name: 'WASABI CREATION LIMITED'
  }, {
    email: 'hkpcenq@hkpc.org',
    name: 'Hong Kong Productivity Council'
  }, {
    email: 'hr.recruit@christian-action.org.hk',
    name: 'Christian Action 勵行會'
  }, {
    email: 'angela.ng@aaaa.com.hk',
    name: 'The Association of Accredited Advertising Agencies of Hong Kong'
  }, {
    email: 'enquiry@brightsolution.info',
    name: 'Bright Solution Consulting Limited'
  }, {
    email: 'hrd@urban.com.hk',
    name: 'Urban Property Management Limited'
  }, {
    email: 'hr@yaulee.com',
    name: 'Yau Lee Construction Co. Ltd'
  }, {
    email: 'wpl@wongpaklam.com',
    name: 'Wong Pak Lam & Assoc Consulting Engrs & Arch Ltd'
  }, {
    email: 'cs@wongouyang.com',
    name: 'Wong & Ouyang (Civil-Structural Engineering) Ltd.'
  }, {
    email: 'alanchai@hanison.com',
    name: 'Hanison Construction Company Limited'
  }, {
    email: 'winifred.wong@ch2m.com',
    name: 'Halcrow China Limited - ch2m'
  }, {
    email: 'irenetam@gwal.com.hk',
    name: 'GREG WONG & ASSOCIATES LIMITED'
  }, {
    email: 'fandy_lee@hiphing.com.hk',
    name: 'HIP HING CONSTRUCTION COMPANY LIMITED'
  }, {
    email: 'celiachan@hotin.com.hk',
    name: 'HO TIN & ASSOCIATES CONSULTING ENGINEERS LIMITED'
  }, {
    email: 'lamtho@shkp.com',
    name: 'SANFIELD BUILDING CONTRACTORS LIMITED'
  }, {
    email: 'evasum@whconst.com',
    name: 'WO HING CONSTRUCTION COMPANY LIMITED'
  }, {
    email: 'ryochan@beeline-pro.com',
    name: 'Beeline-pro'
  }, {
    email: 'ngem@esquel.com',
    name: 'Esquel Enterprise'
  }, {
    email: 'customerassistant@ralphlauren.asia',
    name: 'Ralph Lauren'
  }, {
    email: 'dora.sze@jacobs.com',
    name: 'jacobs engineering'
  }, {
    email: 'ritacheung@bschk.com',
    name: 'BSC'
  }, {
    email: 'rayluk@hanergy.com',
    name: 'Hanergy'
  }, {
    email: 'NGKAKA@redso.com.hk',
    name: 'Redso'
  }, {
    email: 'doris.lau@madhead.com',
    name: 'Mad Head App Limited'
  }, {
    email: 'EDMONDYU@CLOUDPILLAR.COM.HK',
    name: 'Cloud pillar'
  }, {
    email: 'HIMST.LEE@NWSTOR.COM',
    name: 'Nwstor'
  }, {
    email: 'gloriacheung@joyaether.com',
    name: 'JoyAether'
  }, {
    email: 'info@qbssystem.com',
    name: 'QBS'
  }, {
    email: 'Mandy.tam@wesoft.com',
    name: 'Wesoft - duplicated'
  }, {
    email: 'karen@hcg.com.hk',
    name: 'HSIN CHONG CONSTRUCTION COMPANY LIMITED'
  }, {
    email: 'keeley.tam@siemens.com',
    name: 'SIEMENS LIMITED'
  }, {
    email: 'canwest@canwest.com.hk',
    name: 'Canwest Consultants Limited'
  }, {
    email: 'kelvin.ng@nanfung.com',
    name: 'Nan Fung Development Limited'
  }, {
    email: 'gavin.cheung@aecom.com',
    name: 'AECOM'
  }, {
    email: 'hr.hk@uobgroup.com',
    name: 'UNITED OVERSEAS BANK LIMITED'
  }, {
    email: 'recruit@pordahavas.com',
    name: 'PORDA HAVAS INTERNATIONAL FINANCE COMMUNICATIONS (GROUP) HOLDINGS COMPANY LIMITED'
  }, {
    email: 'marie.w.cheung@jpmorgan.com',
    name: 'JPMORGAN CHASE BANK, NATIONAL ASSOCIATION'
  }, {
    email: 'info@gapsk.org',
    name: 'Doris GAPSK'
  }, {
    email: 'carmenwong@emperorgroup.com',
    name: 'Emperor Group Limited'
  }, {
    email: 'recruit@hk.issworld.com',
    name: 'ISS HONG KONG SERVICES LIMITED'
  }, {
    email: 'rossella.chu@eclipseoptions.com',
    name: 'Eclips trading'
  }, {
    email: 'jtse53@bloomberg.net',
    name: 'Bloomberg'
  }, {
    email: 'a-irwon@microsoft.com',
    name: 'microsoft'
  }, {
    email: 'kasiu@deloitte.com.hk',
    name: 'Deloitte'
  }, {
    email: 'allyssa.sh.chan@hk.pwc.com',
    name: 'PwC'
  }, {
    email: 'sally.chan@hsbc.com.hk',
    name: 'HSBC'
  }, {
    email: 'celia.wong@isshk.org',
    name: 'INTERNATIONAL SOCIAL SERVICE (HONG KONG BRANCH)'
  }, {
    email: 'trazi@redress.com.hk',
    name: 'reDress Limited'
  }, {
    email: 'andreangwy@gmail.com',
    name: 'EARTHCARE (HONG KONG) LIMITED'
  }, {
    email: 'career@jollykingdom.com',
    name: 'Jolly Kingdom International English Center'
  }, {
    email: 'hr2@dropshipgs.com',
    name: 'Drop-Shipping Global Services Limited'
  }, {
    email: 'trainer@easytraininggroup.com',
    name: 'Easy Training Services'
  }, {
    email: 'careers_apac@emarsys.com',
    name: 'emarsys Limited'
  }, {
    email: 'info@twfhk.org.hk',
    name: 'The Women\'s Foundation'
  }, {
    email: 'sales@tunghinghk.com',
    name: 'Tung Hing Computer System Ltd'
  }, {
    email: 'hr@turbojet.com.hk',
    name: 'TURBO JET LIMITED'
  }, {
    email: 'celia.lai@dt-asia.com',
    name: 'DT Communications Asia Pacific Limited'
  }, {
    email: 'info@techworksasia.com',
    name: 'Techworks Asia Limited'
  }, {
    email: 'asiapac@kingdee.com',
    name: 'Kingdee International Software Group Company Limited'
  }, {
    email: 'hrd@bhk.konicaminolta.hk',
    name: 'Konica Minolta Business Solutions (HK) Limited'
  }, {
    email: 'ss_recruit@navicat.com',
    name: 'PremiumSoft CyberTech Limited'
  }, {
    email: 'dwu@milletmountain.group.com',
    name: 'LAFUMA'
  }, {
    email: 'alleen.so@time-medical.com',
    name: 'Time Medical Limited'
  }, {
    email: 'raymond.wong@i-software.com.hk',
    name: 'Intelligent Software Co., Limited'
  }, {
    email: 'office@leungandwan.com',
    name: 'Boen Capital Limited'
  }, {
    email: 'recruit@esrichina.hk',
    name: 'ESRI China'
  }, {
    email: 'curtis@gramcapital.hk',
    name: 'Gram Capital Limited'
  }, {
    email: 'dgf_recruit.hk@dhl.com',
    name: 'DHL Global Forwarding Division'
  }, {
    email: 'vking@hkmedsup.com.hk',
    name: 'Hong Kong Medical Supplies Ltd-Sales'
  }, {
    email: 'jeffreywcn@hk.inditex.com',
    name: 'Zara Asia'
  }, {
    email: 'personnel@wharfholdings.com',
    name: 'Wharf'
  }, {
    email: 'doralee@lfasia.com',
    name: 'LF Asia'
  }, {
    email: 'jacky.sk.ng@yuanta.com',
    name: 'Yuanta Securities'
  }, {
    email: 'debbie.kwok@dksh.com',
    name: 'DKSH'
  }, {
    email: 'man.cm.ho@hkjc.org.hk',
    name: 'Jockey Club'
  }, {
    email: 'info-cs@sony.com.hk',
    name: 'Sony'
  }, {
    email: 'recruit.hk@thalesgruop.com',
    name: 'Thales'
  }, {
    email: 'cer@hk.bureauveritas.com',
    name: 'Bureau veritas'
  }, {
    email: 'hr@savills.com.hk',
    name: 'Savills'
  }, {
    email: 'Abbie.wong@wastech.com.hk',
    name: '保然技術 Waste & Environmental Technologies'
  }, {
    email: 'info@rehab-robotics.com',
    name: '復康機器人技術 rehab robotics'
  }, {
    email: 'awan@pti.com.hk',
    name: '百利通半導體'
  }, {
    email: 'marketing@pantarei-design.com',
    name: 'PantaRei Design'
  }, {
    email: 'infohk@neurosky.com',
    name: '神念（香港） NeuroSky'
  }, {
    email: 'info@netcaves.com',
    name: '網洞 netcaves'
  }, {
    email: 'rickytan@musashi-technology.com',
    name: '武藏科技 musashi-engineering'
  }, {
    email: 'ajleong@m-mos.com',
    name: 'M-MOS'
  }, {
    email: 'stapler@minilogic.com.hk',
    name: 'Minilogic微創高科'
  }, {
    email: 'info@micrel.com.hk',
    name: 'Micrel Semiconductor HK'
  }, {
    email: 'William.wong@meteorsis.com',
    name: 'METEORSIS'
  }, {
    email: 'zhinfo@rayben.com',
    name: '樂健集團'
  }, {
    email: 'wjiang@lpipo.com',
    name: 'LPI Precision Optics'
  }, {
    email: 'w.lo@medpace.com',
    name: 'Medpace Hong Kong'
  }, {
    email: 'venus@gtbf.com.hk',
    name: '萬訊國際'
  }, {
    email: 'teresachiu@linkzindustries.com',
    name: '領先工業'
  }, {
    email: 'vincent@linkco.com.hk',
    name: '聚英科技'
  }, {
    email: 'info@lighthouse-tech.com',
    name: '兆光科技'
  }, {
    email: 'info@leespharm.com',
    name: '李氏大藥廠'
  }, {
    email: 'sales@kopin.com.hk',
    name: '高平科技'
  }, {
    email: 'phyllischow@kingboard.com',
    name: '建滔化工集團 Kingboard Chemical Holdings Ltd.'
  }, {
    email: 'suki.lai@s-techs.com',
    name: 'Insource Hong Kong'
  }, {
    email: 'roy.y.hkwd@outlook.com',
    name: '香港匯智大庫物流高科技 wealth depotplastic'
  }, {
    email: 'rosanalee@goldenregent.com',
    name: '鴻萬電子實業 goldenregen'
  }, {
    email: 'info@geneharbor.com.hk',
    name: '基因港 GeneHarbor (Hong Kong) Biotechnologies Limited'
  }, {
    email: 'iris-cheng@fehk.fujielectric.com',
    name: '富士電機（香港 fuji electric'
  }, {
    email: 'dawn.lam@freescale.com',
    name: '飛思卡爾半導體香港 freescale'
  }, {
    email: 'alicekwong@ewell.hk',
    name: 'Ewell Hong Kong Limited'
  }, {
    email: 'tonyfong@etron-hk.com',
    name: '鈺創科技（香港'
  }, {
    email: 'huqin@enanohealth.compat',
    name: 'eNano Health Limited'
  }, {
    email: 'joseph.tong@e-jing.net',
    name: '易經科技'
  }, {
    email: 'holly.wang@towngas.com',
    name: '易高環保能源研究院'
  }, {
    email: 'felix.wong@dragonchip.com',
    name: '龍微電子有限公司'
  }, {
    email: 'polo@diysite.com',
    name: '自助網有'
  }, {
    email: 'christine.tong@dao-lab.com',
    name: '立道研究所'
  }, {
    email: 'eoschu@clustertech.com',
    name: '聯科集團'
  }, {
    email: 'hrdept@castelecom.com',
    name: '中國航天科技通信'
  }, {
    email: 'petrina_wong@chiconypower.com.hk',
    name: '群光電能科技香港'
  }, {
    email: 'kim.tey@camsemi.com',
    name: '0 Cambridge Semiconductor'
  }, {
    email: 'info@bloombase.com',
    name: '博隆科技有限公司'
  }, {
    email: 'mc.wong@bit-exchange.net',
    name: 'Bit Exchange Systems'
  }, {
    email: 'florayu@beghelliasia.com',
    name: '百家麗亞太'
  }, {
    email: 'cho@barron-young.com',
    name: '百睿知識產權有限公司'
  }, {
    email: 'sclee@avantwave.com',
    name: '明科網絡有限公司'
  }, {
    email: 'esmondl@atpath.com',
    name: '絡基科技有限公司'
  }, {
    email: 'simonshum@gmail.com',
    name: 'Ashley Technology'
  }, {
    email: 'info@a-onetech.com.hk',
    name: '甲壹科技有限公司'
  }, {
    email: 'twchan@amasic.com.hk',
    name: '美成芯片設計'
  }, {
    email: 'info@alexholaw.com',
    name: '何升偉律師事務所'
  }, {
    email: 'wchan@agamatrix.com.hk',
    name: '安格生物'
  }, {
    email: 'info@apt-hk.com',
    name: '微晶先進光電科技'
  }, {
    email: 'vicky.sze@accuver.com',
    name: 'Accuver Apac'
  }, {
    email: 'sindyng@acousticarc.com',
    name: '聲海國際'
  }, {
    email: 'kitwong@epicon.com.hk',
    name: '德豪（香港）'
  }, {
    email: 'info@3dptechgroup.com',
    name: '三維打印科技'
  }, {
    email: 'tandy@realmax.com.hk',
    name: '瑞豐科技Realmax'
  }, {
    email: 'andyng@sienergyhk.com',
    name: '銳能科技Re-energy technology Co., Ltd.'
  }, {
    email: 'tim.wong@senstation.com',
    name: 'Senstation Limited'
  }, {
    email: 'info@starlight-optical.com',
    name: '星火眼鏡有限公司'
  }, {
    email: 'ian.p@spring-ecotech.com',
    name: 'spring ecotech'
  }, {
    email: 'HR@tfidm.com',
    name: '天開數碼媒體有限公司'
  }, {
    email: 'williamlau73@hotmail.com',
    name: 'Synxia Photonic Technology Limited'
  }, {
    email: 'djbigbrother@gmail.com',
    name: 'Q2B Game Studios'
  }, {
    email: 'info@uacs.hk',
    name: 'UACS Limited'
  }, {
    email: 'contact@qf-eng.com',
    name: 'Quantum Force Engineering'
  }, {
    email: 'wilson.mak@onedigibox.com',
    name: '宏迪亞洲'
  }, {
    email: 'info@playnote.com',
    name: 'Playnote Limited'
  }, {
    email: 'cywong@platysens.com',
    name: 'Platysens Limited'
  }, {
    email: 'tklau@pho-imaging.com',
    name: 'PHO Imaging'
  }, {
    email: 'yu.chen@phinarys.com',
    name: 'Phinary Systems'
  }, {
    email: 'info@opticalsensing-hk.com',
    name: '光傳感有限'
  }, {
    email: 'CEO@NEOGENO.COM',
    name: 'Neogeno Technology'
  }, {
    email: 'sunny@ncelltech.com',
    name: '泰生科技N Cell'
  }, {
    email: 'garylee@mobilee2e.com',
    name: 'MobileE2E'
  }, {
    email: 'jason@metaxtech.com.hk',
    name: 'Metax Technology'
  }, {
    email: 'info@m-caretech.com',
    name: 'm-Care Technology'
  }, {
    email: 'luk@megaunit-tech.com',
    name: 'Mega Unit Technology'
  }, {
    email: 'info@bluegic.com',
    name: 'Lincogn Technology'
  }, {
    email: 'info@iLinkedTech.com',
    name: 'LinkedTech Solutions'
  }, {
    email: 'angela.ng@liricco.com',
    name: '旨豐科技'
  }, {
    email: 'alan.so@livelyimpact.com',
    name: '利聯互動科技Lively Impact Technology Limited.'
  }, {
    email: 'edgar@intertech.hk',
    name: 'Interactive Technology'
  }, {
    email: 'info@weddingmustgo.com',
    name: '加冠創科技'
  }, {
    email: 'ben.wong@i-peta.com',
    name: 'Hong Kong Tesla Technology'
  }, {
    email: 'andylam@greendecorp.com',
    name: '芊菉有限公司 Green de Corp. Limited'
  }, {
    email: 'johomaps@hotmail.com',
    name: 'Hippomap Technology'
  }, {
    email: 'ryanyeung@happy-retired.com',
    name: 'Happy-Retired Company'
  }, {
    email: 'sam@fanswifi.com',
    name: 'FansWave Limited'
  }, {
    email: 'cs@driver.com.hk',
    name: 'Driver.com.hk'
  }, {
    email: 'dkam@dnetsolution.com',
    name: 'DNet Solution'
  }, {
    email: 'admin@couchy.tv',
    name: 'Couchy Media Co Limited'
  }, {
    email: 'henry@delightintl.com',
    name: 'Delight Power Products'
  }, {
    email: 'samuelip@clovergreen.com.hk',
    name: 'clover green'
  }, {
    email: 'info@cloudpillar.com.hk',
    name: 'cloudpillar'
  }, {
    email: 'info@cloudoceantech.com',
    name: 'Cloud Ocean Software'
  }, {
    email: 'john@cityimage.com.hk',
    name: '城市圖像科技cityimage'
  }, {
    email: 'enquiry@censpothk.com',
    name: 'Censpot Trading Corporation'
  }, {
    email: 'grace.lee@cenique.com',
    name: '怡能媒體有限公司CENIQUE INFOTAINMENT GROUP LIMITED'
  }, {
    email: 'b.strong@int88.biz',
    name: 'int88'
  }, {
    email: 'joeycham@axon-labs.com',
    name: 'Axon Labs Limited /'
  }, {
    email: 'jack@atcipher.com',
    name: 'AtCipher.com Limited'
  }, {
    email: 'steven@aroy.us',
    name: 'Aroy Innovation Company'
  }, {
    email: 'ctsang@archimediatech.com',
    name: 'archimediatech'
  }, {
    email: 'Cruise.siu@appunique.com',
    name: 'app unique'
  }, {
    email: 'evan@app-mocha.com',
    name: 'app mocha'
  }, {
    email: 'venus.lee@aedify.com.hk',
    name: 'aedify'
  }, {
    email: 'info@ackuis.com',
    name: 'ackuis'
  }, {
    email: 'carrie@greatplan.com.hk',
    name: 'Great Plan'
  }, {
    email: 'iris@sinopec.com',
    name: 'Sinopec'
  }, {
    email: 'hrs@fancl-hk.com',
    name: 'FANCL'
  }, {
    email: 'vivian.wong@prasia.net',
    name: 'PR Asia - contact vivian wong'
  }, {
    email: 'peyo@frement.com',
    name: 'Frement Company Limited'
  }, {
    email: 'contact.hk@siemens.com',
    name: 'SIEMENS duplicated use another'
  }, {
    email: 'mandy.sin@thegateworldwide.com',
    name: 'Gate Worldwide Limited'
  }, {
    email: 'ithr@redcross.org.hk',
    name: 'Hong Kong Red Cross'
  }, {
    email: 'calvinho@thewgo.org',
    name: 'WORLD GREEN ORGANISATION LIMITED'
  }, {
    email: 'post@neonking.com.hk',
    name: '0 NEON KING LIMITED'
  }, {
    email: 'human.resources@kcs.com',
    name: 'KCS Hong Kong Limited'
  }, {
    email: 'emma.yeung@ndn.com.hk',
    name: 'NDN GROUP (HK) LIMITED'
  }, {
    email: 'contact@fif.org.hk',
    name: 'carnet jewellery / FIRST INITIATIVE FOUNDATION LIMITED'
  }, {
    email: 'vde-hk@vde.com',
    name: 'VDE Global Services HK Ltd'
  }, {
    email: 'sheren.mak@goldenharvest.com',
    name: 'Golden harvest'
  }, {
    email: 'vicki@drake.com.hk',
    name: 'DRAKE'
  }, {
    email: 'hr-shop@lukfook.com',
    name: 'LUKFOOK JEWELLERY'
  }, {
    email: 'andrea.cheung@vitasoy.com',
    name: 'Vitasoy International Holdings Ltd'
  }, {
    email: 'fanyx@antonoil.com',
    name: 'Anton Oilfeild'
  }, {
    email: 'raymondmh.fung@ap.jll.com',
    name: 'JLL - jones lang lasalle'
  }, {
    email: 'postdoc@cmhk.com',
    name: 'China Merchants Group Limited'
  }, {
    email: 'recruit1@swireproperties.com',
    name: 'Swire Properties Ltd'
  }, {
    email: 'cherie.cheuk@dhl.com',
    name: 'DHL Supply Chain (Hong Kong) Limited'
  }, {
    email: 'vivian.cylee@zungfu.com',
    name: 'Zung Fu Co Ltd'
  }, {
    email: 'lucinda.p@tuition.com.hk',
    name: 'ITS Educational Services Limited'
  }, {
    email: 'adminhk@cohnwolfe.com',
    name: 'Cohn & Wolfe Impact Asia Limited'
  }, {
    email: 'jackyko1109@yahoo.com.hk',
    name: 'Music Zone Company Limited'
  }, {
    email: 'careers@shichidahk.com',
    name: 'SHICHIDA EDUCATIONAL INSTITUTE (HK) LIMITED'
  }, {
    email: 'hr@radicasys.com',
    name: 'RADICA SYSTEMS LIMITED'
  }, {
    email: 'office@adbrownies.com',
    name: 'ADBROWNIES ADVERTISING LIMITED'
  }, {
    email: 'jobshk@quintessentially.com',
    name: 'Quintessentially (HK) Limited'
  }, {
    email: 'info@youthsquare.hk',
    name: 'NEW WORLD FACILITIES MANAGEMENT COMPANY LIMITED'
  }, {
    email: 'fimmickers@fimmick.com',
    name: 'FOCUS IMAGING LIMITED'
  }, {
    email: 'verena.ng@ncchk.com',
    name: 'NC COMMUNICATIONS LIMITED'
  }, {
    email: 'info@dchk.net',
    name: 'DESIGNERCITY (HK) LIMITED'
  }, {
    email: 'recruit@jumpingym.com',
    name: 'jumpingym'
  }, {
    email: 'jdehr@jumpingym.com',
    name: 'Jumpin Gym Digital Entertainment Limited'
  }, {
    email: 'jmhr@joinmerit.com',
    name: 'JM NETWORK LIMITED'
  }, {
    email: 'eyung@capa.com.hk',
    name: 'CAPA GREATER CHINA LIMITED'
  }, {
    email: 'rexant@hotmail.com.hk',
    name: 'Rexant International Ltd'
  }, {
    email: 'gca@hit.com.hk',
    name: 'HONGKONG INTERNATIONAL TERMINALS LIMITED'
  }, {
    email: 'recruit.admin@hk.mrspedag.com',
    name: 'M&R Forwarding (HK) Ltd.'
  }, {
    email: 'knhkg.hr@kuehne-nagel.com',
    name: 'Kuehne & Nagel Limited'
  }, {
    email: 'jennis.ng@dice.com',
    name: 'EFINANCIAL CAREERS PTE. LTD.'
  }, {
    email: 'ad@baobab-tree-event.com',
    name: 'Baobab Tree Event Management Company Limited'
  }, {
    email: 'cfung@globalsources.com',
    name: 'Global Sources Limited'
  }, {
    email: 'info@prosearch.com.hk',
    name: 'Pro Search (Asia) Ltd.'
  }, {
    email: 'hr@guruonline.com.hk',
    name: 'AdBeyond (Group) Limited'
  }, {
    email: 'whk@williams-asia.com',
    name: 'Williams (Hong Kong) Limited'
  }, {
    email: 'hr@gamma.com.hk',
    name: 'Gamma Hong Kong Limited'
  }, {
    email: 'ann.chan@daimler.com',
    name: 'Ms Ann Chan Daimler'
  }, {
    email: 'intern@clb.org.hk',
    name: 'China Labour Bulletin'
  }, {
    email: 'queenie.chee@etrali.com',
    name: 'Etrali Trading Solutions'
  }, {
    email: 'info@ardent-sage.com.hk',
    name: 'ARDENT SAGE CONSULTING LIMITED'
  }, {
    email: 'human-resources@uwine.asia',
    name: 'U\'WINE ASIA LIMITED'
  }, {
    email: 'info@wizdom.com.hk',
    name: 'Wizdom Learning Centre Limited'
  }, {
    email: 'contact@taneley.com',
    name: 'TANELEY LIMITED'
  }, {
    email: 'Info@steps.edu.hk',
    name: 'Steps Education Limited'
  }, {
    email: 'polarcl@netvigator.com',
    name: 'Polaris Consultancy Limited'
  }, {
    email: 'silvia.hellbach@tbwa.com',
    name: 'TBWA Hong Kong Limited'
  }, {
    email: 'crystal.li@ubm.com',
    name: 'UBM Asia'
  }, {
    email: 'davidtsang@mobicon.com',
    name: 'Milliard Devices Limited'
  }, {
    email: 'katrina.sun@text100.com.hk',
    name: 'text100'
  }, {
    email: 'hr_admin@stablesys.com',
    name: 'Stable System (HK) Limited'
  }, {
    email: 'emily.li@appcogroup.asia',
    name: 'Appco HK Limited'
  }, {
    email: 'Hongkong@munichre.com',
    name: 'Munich Reinsurance Company (Hong Kong Branch Office)'
  }, {
    email: 'career@hkstc.org',
    name: 'HONG KONG STANDARDS AND TESTING CENTRE LIMITED -THE-'
  }, {
    email: 'info@inno-tech.com.hk',
    name: 'Inno-Tech Design Consultant Limited'
  }, {
    email: 'winee.wu@microdia.com',
    name: 'MICRODIA Limited'
  }, {
    email: 'info@tuv-sud.hk',
    name: 'TUV SUD HONG KONG LIMITED'
  }, {
    email: 'evenchem@yahoo.com.hk',
    name: 'Even Chemicals Development Limited'
  }, {
    email: 'stephen.yu@grifols.com',
    name: 'Grifols (HK) Limited'
  }, {
    email: 'recruit@europharm.com.hk',
    name: 'Europharm Laboratoires'
  }, {
    email: 'lawrence.pam@parkwayhongkong.com',
    name: 'Parkway HealthCare'
  }, {
    email: 'candy.yeung@nhtglobal.com',
    name: 'NHT Global Hong Kong Ltd'
  }, {
    email: 'janice.tang@vincent-raya.com',
    name: 'Vincent Medical'
  }, {
    email: 'hr.eurekahk@gmail.com',
    name: 'Eureka Language Education Centre'
  }, {
    email: 'info.hk@orbis.org',
    name: 'ORBIS CHINA HONG KONG LIMITED'
  }, {
    email: 'hrdept@worldvision.org.hk',
    name: 'World Vision Hong Kong - 宣明會'
  }, {
    email: 'info@sun-kids.hk',
    name: 'Founder - Sunkids Limited'
  }, {
    email: 'arna.heung@esfcentre.edu.hk',
    name: 'EF - English Schools Foundation'
  }, {
    email: 'jayson@maplelearninghk.com',
    name: 'Maple Learning HK'
  }, {
    email: 'recruit@popularworld.com',
    name: 'EDUCATIONAL PUBLISHING HOUSE, LIMITED'
  }, {
    email: 'hr@nelson-jewellery.com',
    name: 'NELSON JEWELLERY ARTS CO. LIMITED'
  }, {
    email: 'hkstc@hkstc.org',
    name: 'The Hong Kong Standards and Testing Centre Ltd.'
  }, {
    email: 'rsqchatham@gmail.com',
    name: 'Red Square Education Centre'
  }, {
    email: 'wywong@fugro.com.hk',
    name: 'Fugro (Hong Kong) Limited rejected'
  }, {
    email: 'tommywong@freyssinet.com.hk',
    name: 'Freyssinet Hong Kong Limited'
  }, {
    email: 'mandy@modernenglish.com.hk',
    name: 'ME English Language Centre'
  }, {
    email: 'rachel.hung@sheraton.com',
    name: 'Sheraton Hong Kong Hotel & Towers'
  }, {
    email: 'info@myseasons.com.hk',
    name: 'MY SEASONS HOLDING LIMITED'
  }, {
    email: 'hr@royalview.com.hk',
    name: 'RoYAL VIEW HOTEL'
  }, {
    email: 'career.hkh@marcopolohotels.com',
    name: 'Marco Polo Hong Kong Hotel '
  }, {
    email: 'hr@pure-international.com',
    name: 'PURE INTERNATIONAL (HK) LIMITED'
  }, {
    email: 'zoechu@cistour.com',
    name: 'C.I.S. & CO., LIMITED'
  }, {
    email: 'mandy.chan@parkhotelgroup.com',
    name: 'Park Hotel International Limited'
  }, {
    email: 'hongkong@ihg.com',
    name: 'InterContinental Hong Kong Limited'
  }, {
    email: 'career@harbour-plaza.com',
    name: 'Harbour Grand Hong Kong Limited'
  }, {
    email: 'talent@miramar-group.com',
    name: 'The Mira Hong Kong Limited'
  }, {
    email: 'kitty.wong@hkri.com',
    name: '香港興業HKR International Ltd'
  }, {
    email: 'humanresouces@goldcoastclub.com.hk',
    name: 'GOLD COAST YACHT AND COUNTRY CLUB LIMITED'
  }, {
    email: 'recruit@bolognecafe.com.hk',
    name: '博洛尼亞咖啡店'
  }, {
    email: 'jessica.recruitment@langhamhotels.com',
    name: 'Langham Place'
  }, {
    email: 'careers@lanecrawford.com',
    name: 'Lane Crawford'
  }, {
    email: 'contact@ecsquare.net',
    name: 'EC Square PR And Events Company Limited'
  }, {
    email: 'selina@mdfa.net',
    name: 'Meta4 Design Forum Limited'
  }, {
    email: 'hr@asiaworld-expo.com',
    name: 'Asia-World Expo Management Limited'
  }, {
    email: 'ph.leung@hkjebn.com',
    name: 'HK JEBN Limited'
  }, {
    email: 'anthonyw@technosofthk.com',
    name: 'TECHNOSOFT HONGKONG LIMITED'
  }, {
    email: 'joni.chung@searsch.com',
    name: 'Sears Holdings Global Sourcing Limited'
  }, {
    email: 'yuki@fmarketing.hk',
    name: 'EMarketing Technology Limited'
  }, {
    email: 'recruit@sdm.hk',
    name: 'Rainbow Creative Arts'
  }, {
    email: 'hr@flexsystem.com',
    name: 'FlexSystem Limited'
  }, {
    email: 'fh@fh.com.hk',
    name: 'Creative Effort Limited'
  }, {
    email: 'tammy@telekommalaysia.com.hk',
    name: 'Telekom Malaysia (Hong Kong) Limited'
  }, {
    email: 'mchow@ximedica.com',
    name: 'Ximedica, LLC'
  }, {
    email: 'hr_hongkong@hugoboss.com',
    name: 'Hugo boss'
  }, {
    email: 'fiona.siu@cliftons.com',
    name: 'Cliftons Ltd'
  }, {
    email: 'sophie_so@harveynichols.com.hk',
    name: 'Harvey Nichols'
  }, {
    email: 'erica.ming@wankeegroup.com.hk',
    name: '允記集團'
  }, {
    email: 'hr@pyengineering.com',
    name: 'Paul Y. (E&M) Contractors Limited'
  }, {
    email: 'pwcel@paulwong.com.hk',
    name: 'PAUL WONG CONSULTING ENGINEERS LIMITED'
  }, {
    email: 'natalie@cgsenergy.com.hk',
    name: 'China ground source energy'
  }, {
    email: 'christine.yip@erm.com',
    name: 'ERM'
  }, {
    email: 'ricochan@atal.com.hk',
    name: 'ATAL'
  }, {
    email: 'lokwy@bv.com',
    name: 'Black & Veatch call '
  }, {
    email: 'kaya.lee@aecom.com',
    name: 'URS Hong Kong - AECOM'
  }, {
    email: 'eaglemo@telemaxeem.com',
    name: 'Telemax Enviormental'
  }, {
    email: 'maggie.cheung@honeywell.com',
    name: 'Honeywell'
  }, {
    email: 'mandyym@mtr.com.hk',
    name: 'MTR '
  }, {
    email: 'Wanda.wong@alstom.com',
    name: 'Alstom'
  }, {
    email: 'dora.cheung@hld.com',
    name: 'Henderson land development company'
  }, {
    email: 'janet.wm.kam@linkreit.com',
    name: 'The Link Management Limited'
  }, {
    email: 'alicetsang@fareastglobal.com',
    name: 'Far East Global Group Limited'
  }, {
    email: 'hr-acws@acw-group.com.hk',
    name: 'ACW Solutions Limited'
  }, {
    email: 'hr@cmi.chinamobile.com',
    name: 'China Mobile International Limited'
  }, {
    email: 'hrhk@cn.wpgholdings.com',
    name: 'WPG Electronics (HK) Limited'
  }, {
    email: 'jenny.sn.ho@pccw.com',
    name: 'PCCW Limited - SOL'
  }, {
    email: 'hrdept@tradelink.com.hk',
    name: 'Digi-Sign Certification Services'
  }, {
    email: 'recruit@clts.com',
    name: 'CL Technical Services Ltd.'
  }, {
    email: 'liz.yu@lianatech.com',
    name: 'liana technologies'
  }, {
    email: 'betsinda.lau@microdia.com',
    name: 'Microdia (Greater China) Limited'
  }, {
    email: 'jobs@palapple.com',
    name: 'Palapple(Hong Kong) Limited'
  }, {
    email: 'career@zensis.com',
    name: 'Zensis Limited'
  }, {
    email: 'enquiry@v-careasia.com',
    name: 'V-Care Asia Ltd - Duplicated'
  }, {
    email: 'vincentmh.wu@arrowasia.com',
    name: 'Arrow Asia Pac Ltd'
  }, {email: 'echan@laputatech.com', name: 'Laputa Technologies'}, {
    email: 'recruitment@pigeoncity.com.hk',
    name: 'Pigeon City Technology (HK) Limited'
  }, {email: 'hr@gofun.com', name: 'Go Fun Card Ltd 高分卡有限公司'
  }, {
    email: 'elizalau@suncreation.com',
    name: 'Sun Creation Engineering Ltd'
  }, {
    email: 'cnc_poon@yahoo.com.hk',
    name: 'Clickclock Ltf'
  }, {
    email: 'Anita_lui@whirlpool.com',
    name: 'Whirlpool(Hong Kong) Limited'
  }, {
    email: 'hk.career@echarris.com',
    name: 'EC HARRIS (HONG KONG) LIMITED call on 19/5'
  }, {
    email: 'hrdept@gammonconstruction.com',
    name: 'Gammon Construction Limited'
  }, {
    email: 'hr@hk.tdk.com',
    name: 'TDK HONGKONG COMPANY LIMITED'
  }, {
    email: 'sandy.chan@jec.com',
    name: 'The Jardine Engineering Corp. Ltd.'
  }, {
    email: 'ekong@hec.com.hk',
    name: 'The Hong kong Electric Co., Ltd.'
  }, {
    email: 'info@szecheonghk.com',
    name: 'Sze Cheong (HK) Engineering Limited'
  }, {
    email: 'david.mak@utc.com',
    name: 'Carrier Hong Kong Ltd.'
  }, {
    email: 'kktong@dchmsc.com.hk',
    name: 'Dah Chong Hong (Motor Service Centre) Ltd.'
  }, {
    email: 'winnie@nagase.com.hk',
    name: 'Nagase (Hong Kong) Limited'
  }, {
    email: 'joey.kong@jinchat.com',
    name: 'Jinchat'
  }, {
    email: 'tlau@asiasat.com',
    name: 'Asia Satellite Company Limited'
  }, {
    email: 'maria.ma@canadiansolar.com',
    name: 'canadian solar'
  }, {
    email: 'helen.chau@chicony.com.tw',
    name: 'Chincoy'
  }, {
    email: 'jiayao@bomesc.com',
    name: 'BOMESC'
  }, {
    email: 'talana.ye@media.com',
    name: '美的 (China)'
  }, {
    email: 'wang.honde.honda@emerson.com',
    name: 'Emerson (China)'
  }, {
    email: 'alvin.cp.chan@johnsonelectric.com',
    name: 'Johnson Electric Hong Kong'
  }, {
    email: 'hr@sirhudson.com',
    name: 'Sir Hudson International Limited'
  }, {
    email: 'winnie.tam@bankofsingapore.com',
    name: 'Bank of Singapore'
  }, {
    email: 'eva-wm.cheung@hk.ey.com',
    name: 'EY'
  }, {
    email: 'daphny.lai@kpmg.com',
    name: 'KPMG'
  }, {
    email: 'kenny.lam.pn@gloryskygroup.com',
    name: 'Glory Sky'
  }, {
    email: 'recruit.hr@joviancomm.com',
    name: 'Jovian Financial Communications Limited'
  }, {
    email: 'mschan@syleung.com',
    name: 'S. Y. Leung & Partners'
  }, {
    email: 'vicky.chan@suez.com',
    name: 'Sita Waste Services'
  }, {
    email: 'crystal.chiu@apcapitalinvestment.com',
    name: 'AP Capital Investment'
  }, {
    email: 'internship.hk@goodman.com',
    name: 'Goodman Asia Limited'
  }, {
    email: 'recruitment@svsamford.com',
    name: 'SV Samford'
  }, {
    email: 'hkoffice@cguardian.com.hk',
    name: 'China Guardian (Hong Kong) Auctions Co., Limited'
  }, {
    email: 'mkt@honwellrattan.com',
    name: 'Honwell Rattan & Wicker Manufacturing Limited'
  }, {
    email: 'hrdept@hk.chinamobile.com',
    name: 'China Mobile Hong Kong Company'
  }, {
    email: 'hr@chiefgroup.com',
    name: 'Chief Securities Limited'
  }, {
    email: 'winnie_chan@klaser.com.hk',
    name: 'K Laser Technology'
  }, {
    email: 'hr2014@innoverz.com',
    name: 'Innoverz Limited'
  }, {
    email: 'harold@plannetworkshop.com',
    name: 'Plannet Workshop'
  }, {
    email: 'jyfan@lutron.com',
    name: 'Lutron'
  }, {
    email: 'angeko@dairy-farm.com.hk',
    name: 'Dairy farm'
  },
];


let auth0Token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJyRVVNem9uS09XaU1EQjZUeUdzS0pLZkJuamlRdDZFSCIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInJlYWQiLCJjcmVhdGUiLCJkZWxldGUiLCJ1cGRhdGUiXX0sInVzZXJfaWRwX3Rva2VucyI6eyJhY3Rpb25zIjpbInJlYWQiXX19LCJpYXQiOjE0NzkzNjYzNDEsImp0aSI6IjQ2MzE0Y2YyMDA0MjYxMmU2Yjk2MmJhMTlmMzNmYzBjIn0.-NjpadxJY9JvtFLk4UBpdSjxgU2Ul3jIU-abP-UYUHU';
let auth0Domain = 'freshlinker.auth0.com';

let insertDataPromise = [];


for (let i = 900; i < 955; i++) {

  insertDataPromise.push(new Promise(async function (resolve, reject) {
    let user = data[i];
    user.password = makePassword();
    let findUser = await new Promise(function (resolve, reject) {
      request
        .get(`https://${auth0Domain}/api/v2/users`)
        .query({
          "q": `email:"${user.email}"`,
        })
        .set('Authorization', auth0Token)
        .end(function (err, res) {
          resolve(res.body[0]);
        });
    });
    if (typeof findUser === 'undefined') {
      debug('trying to create user!');
      request
        .post(`https://${auth0Domain}/api/v2/users`)
        .send({
          "connection": "Username-Password-Authentication",
          "email": user.email,
          "name": user.email,
          "password": user.password,
          "user_metadata": {},
          "email_verified": true,
          "app_metadata": {}
        })
        .set('Authorization', auth0Token)
        .end(function (err, res) {
          if (err) logger.log('error', err)
          debug(`done ${i}, ${user.email}`);
          logger.log('info', user);
          resolve(res.text);
        });

    } else {
      debug('trying to update password!');
      request
        .patch(`https://${auth0Domain}/api/v2/users/${findUser.user_id}`)
        .send({
          "connection": "Username-Password-Authentication",
          "password": user.password,
        })
        .set('Authorization', auth0Token)
        .end(function (err, res) {
          if (err) logger.log('error', err)
          debug(`done ${i}, ${user.email}`);
          logger.log('info', user);
          resolve(res.text);
        });
    }

  }));
}

Promise.all(insertDataPromise).then(function (result) {
  debug('all done!');
});

function makePassword() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
