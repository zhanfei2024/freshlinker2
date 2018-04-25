'use strict';

let _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Country', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {fields: ['code']}
    ],
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {},
    hierarchy: {
      freezeTableName: true,
      camelThrough: true,
      as: 'parent',
      levelFieldName: 'depth'
    }
  });

  // Class Method
  Model.getEditableKeys = function (){
    return ['parentId', 'depth', 'code', 'name'];
  };
  Model.initSeed = function (){
    let countries = [
      {"id": 1, "name": "Afghanistan", "code": "AFG"}, {"id": 2, "name": "Åland Islands", "code": "ALA"}, {
        "id": 3,
        "name": "Albania",
        "code": "ALB"
      }, {"id": 4, "name": "Algeria", "code": "DZA"}, {"id": 5, "name": "American Samoa", "code": "ASM"}, {
        "id": 6,
        "name": "Andorra",
        "code": "AND"
      }, {"id": 7, "name": "Angola", "code": "AGO"}, {"id": 8, "name": "Anguilla", "code": "AIA"}, {
        "id": 9,
        "name": "Antigua and Barbuda",
        "code": "ATG"
      }, {"id": 10, "name": "Argentina", "code": "ARG"}, {"id": 11, "name": "Armenia", "code": "ARM"}, {
        "id": 12,
        "name": "Aruba",
        "code": "ABW"
      }, {"id": 13, "name": "Australia", "code": "AUS"}, {"id": 14, "name": "Austria", "code": "AUT"}, {
        "id": 15,
        "name": "Azerbaijan",
        "code": "AZE"
      }, {"id": 16, "name": "The Bahamas", "code": "BHS"}, {"id": 17, "name": "Bahrain", "code": "BHR"}, {
        "id": 18,
        "name": "Bangladesh",
        "code": "BGD"
      }, {"id": 19, "name": "Barbados", "code": "BRB"}, {"id": 20, "name": "Belarus", "code": "BLR"}, {
        "id": 21,
        "name": "Belgium",
        "code": "BEL"
      }, {"id": 22, "name": "Belize", "code": "BLZ"}, {"id": 23, "name": "Benin", "code": "BEN"}, {
        "id": 24,
        "name": "Bermuda",
        "code": "BMU"
      }, {"id": 25, "name": "Bhutan", "code": "BTN"}, {"id": 26, "name": "Bolivia", "code": "BOL"}, {
        "id": 27,
        "name": "Bonaire",
        "code": "BES"
      }, {"id": 28, "name": "Bosnia and Herzegovina", "code": "BIH"}, {
        "id": 29,
        "name": "Botswana",
        "code": "BWA"
      }, {"id": 30, "name": "Bouvet Island", "code": "BVT"}, {"id": 31, "name": "Brazil", "code": "BRA"}, {
        "id": 32,
        "name": "British Indian Ocean Territory",
        "code": "IOT"
      }, {"id": 33, "name": "United States Minor Outlying Islands", "code": "UMI"}, {
        "id": 34,
        "name": "British Virgin Islands",
        "code": "VGB"
      }, {"id": 35, "name": "Brunei", "code": "BRN"}, {"id": 36, "name": "Bulgaria", "code": "BGR"}, {
        "id": 37,
        "name": "Burkina Faso",
        "code": "BFA"
      }, {"id": 38, "name": "Burundi", "code": "BDI"}, {"id": 39, "name": "Cambodia", "code": "KHM"}, {
        "id": 40,
        "name": "Cameroon",
        "code": "CMR"
      }, {"id": 41, "name": "Canada", "code": "CAN"}, {"id": 42, "name": "Cape Verde", "code": "CPV"}, {
        "id": 43,
        "name": "Cayman Islands",
        "code": "CYM"
      }, {"id": 44, "name": "Central African Republic", "code": "CAF"}, {
        "id": 45,
        "name": "Chad",
        "code": "TCD"
      }, {"id": 46, "name": "Chile", "code": "CHL"}, {"id": 47, "name": "China", "code": "CHN"}, {
        "id": 48,
        "name": "Christmas Island",
        "code": "CXR"
      }, {"id": 49, "name": "Cocos (Keeling) Islands", "code": "CCK"}, {
        "id": 50,
        "name": "Colombia",
        "code": "COL"
      }, {"id": 51, "name": "Comoros", "code": "COM"}, {
        "id": 52,
        "name": "Republic of the Congo",
        "code": "COG"
      }, {"id": 53, "name": "Democratic Republic of the Congo", "code": "COD"}, {
        "id": 54,
        "name": "Cook Islands",
        "code": "COK"
      }, {"id": 55, "name": "Costa Rica", "code": "CRI"}, {"id": 56, "name": "Croatia", "code": "HRV"}, {
        "id": 57,
        "name": "Cuba",
        "code": "CUB"
      }, {"id": 58, "name": "Curaçao", "code": "CUW"}, {"id": 59, "name": "Cyprus", "code": "CYP"}, {
        "id": 60,
        "name": "Czech Republic",
        "code": "CZE"
      }, {"id": 61, "name": "Denmark", "code": "DNK"}, {"id": 62, "name": "Djibouti", "code": "DJI"}, {
        "id": 63,
        "name": "Dominica",
        "code": "DMA"
      }, {"id": 64, "name": "Dominican Republic", "code": "DOM"}, {
        "id": 65,
        "name": "Ecuador",
        "code": "ECU"
      }, {"id": 66, "name": "Egypt", "code": "EGY"}, {"id": 67, "name": "El Salvador", "code": "SLV"}, {
        "id": 68,
        "name": "Equatorial Guinea",
        "code": "GNQ"
      }, {"id": 69, "name": "Eritrea", "code": "ERI"}, {"id": 70, "name": "Estonia", "code": "EST"}, {
        "id": 71,
        "name": "Ethiopia",
        "code": "ETH"
      }, {"id": 72, "name": "Falkland Islands", "code": "FLK"}, {
        "id": 73,
        "name": "Faroe Islands",
        "code": "FRO"
      }, {"id": 74, "name": "Fiji", "code": "FJI"}, {"id": 75, "name": "Finland", "code": "FIN"}, {
        "id": 76,
        "name": "France",
        "code": "FRA"
      }, {"id": 77, "name": "French Guiana", "code": "GUF"}, {
        "id": 78,
        "name": "French Polynesia",
        "code": "PYF"
      }, {"id": 79, "name": "French Southern and Antarctic Lands", "code": "ATF"}, {
        "id": 80,
        "name": "Gabon",
        "code": "GAB"
      }, {"id": 81, "name": "The Gambia", "code": "GMB"}, {"id": 82, "name": "Georgia", "code": "GEO"}, {
        "id": 83,
        "name": "Germany",
        "code": "DEU"
      }, {"id": 84, "name": "Ghana", "code": "GHA"}, {"id": 85, "name": "Gibraltar", "code": "GIB"}, {
        "id": 86,
        "name": "Greece",
        "code": "GRC"
      }, {"id": 87, "name": "Greenland", "code": "GRL"}, {"id": 88, "name": "Grenada", "code": "GRD"}, {
        "id": 89,
        "name": "Guadeloupe",
        "code": "GLP"
      }, {"id": 90, "name": "Guam", "code": "GUM"}, {"id": 91, "name": "Guatemala", "code": "GTM"}, {
        "id": 92,
        "name": "Guernsey",
        "code": "GGY"
      }, {"id": 93, "name": "Guinea", "code": "GIN"}, {"id": 94, "name": "Guinea-Bissau", "code": "GNB"}, {
        "id": 95,
        "name": "Guyana",
        "code": "GUY"
      }, {"id": 96, "name": "Haiti", "code": "HTI"}, {
        "id": 97,
        "name": "Heard Island and McDonald Islands",
        "code": "HMD"
      }, {"id": 98, "name": "Honduras", "code": "HND"}, {"id": 99, "name": "Hong Kong", "code": "HKG"}, {
        "id": 100,
        "name": "Hungary",
        "code": "HUN"
      }, {"id": 101, "name": "Iceland", "code": "ISL"}, {"id": 102, "name": "India", "code": "IND"}, {
        "id": 103,
        "name": "Indonesia",
        "code": "IDN"
      }, {"id": 104, "name": "Ivory Coast", "code": "CIV"}, {"id": 105, "name": "Iran", "code": "IRN"}, {
        "id": 106,
        "name": "Iraq",
        "code": "IRQ"
      }, {"id": 107, "name": "Republic of Ireland", "code": "IRL"}, {
        "id": 108,
        "name": "Isle of Man",
        "code": "IMN"
      }, {"id": 109, "name": "Israel", "code": "ISR"}, {"id": 110, "name": "Italy", "code": "ITA"}, {
        "id": 111,
        "name": "Jamaica",
        "code": "JAM"
      }, {"id": 112, "name": "Japan", "code": "JPN"}, {"id": 113, "name": "Jersey", "code": "JEY"}, {
        "id": 114,
        "name": "Jordan",
        "code": "JOR"
      }, {"id": 115, "name": "Kazakhstan", "code": "KAZ"}, {"id": 116, "name": "Kenya", "code": "KEN"}, {
        "id": 117,
        "name": "Kiribati",
        "code": "KIR"
      }, {"id": 118, "name": "Kuwait", "code": "KWT"}, {"id": 119, "name": "Kyrgyzstan", "code": "KGZ"}, {
        "id": 120,
        "name": "Laos",
        "code": "LAO"
      }, {"id": 121, "name": "Latvia", "code": "LVA"}, {"id": 122, "name": "Lebanon", "code": "LBN"}, {
        "id": 123,
        "name": "Lesotho",
        "code": "LSO"
      }, {"id": 124, "name": "Liberia", "code": "LBR"}, {"id": 125, "name": "Libya", "code": "LBY"}, {
        "id": 126,
        "name": "Liechtenstein",
        "code": "LIE"
      }, {"id": 127, "name": "Lithuania", "code": "LTU"}, {"id": 128, "name": "Luxembourg", "code": "LUX"}, {
        "id": 129,
        "name": "Macau",
        "code": "MAC"
      }, {"id": 130, "name": "Republic of Macedonia", "code": "MKD"}, {
        "id": 131,
        "name": "Madagascar",
        "code": "MDG"
      }, {"id": 132, "name": "Malawi", "code": "MWI"}, {"id": 133, "name": "Malaysia", "code": "MYS"}, {
        "id": 134,
        "name": "Maldives",
        "code": "MDV"
      }, {"id": 135, "name": "Mali", "code": "MLI"}, {"id": 136, "name": "Malta", "code": "MLT"}, {
        "id": 137,
        "name": "Marshall Islands",
        "code": "MHL"
      }, {"id": 138, "name": "Martinique", "code": "MTQ"}, {"id": 139, "name": "Mauritania", "code": "MRT"}, {
        "id": 140,
        "name": "Mauritius",
        "code": "MUS"
      }, {"id": 141, "name": "Mayotte", "code": "MYT"}, {"id": 142, "name": "Mexico", "code": "MEX"}, {
        "id": 143,
        "name": "Federated States of Micronesia",
        "code": "FSM"
      }, {"id": 144, "name": "Moldova", "code": "MDA"}, {"id": 145, "name": "Monaco", "code": "MCO"}, {
        "id": 146,
        "name": "Mongolia",
        "code": "MNG"
      }, {"id": 147, "name": "Montenegro", "code": "MNE"}, {"id": 148, "name": "Montserrat", "code": "MSR"}, {
        "id": 149,
        "name": "Morocco",
        "code": "MAR"
      }, {"id": 150, "name": "Mozambique", "code": "MOZ"}, {"id": 151, "name": "Myanmar", "code": "MMR"}, {
        "id": 152,
        "name": "Namibia",
        "code": "NAM"
      }, {"id": 153, "name": "Nauru", "code": "NRU"}, {"id": 154, "name": "Nepal", "code": "NPL"}, {
        "id": 155,
        "name": "Netherlands",
        "code": "NLD"
      }, {"id": 156, "name": "New Caledonia", "code": "NCL"}, {
        "id": 157,
        "name": "New Zealand",
        "code": "NZL"
      }, {"id": 158, "name": "Nicaragua", "code": "NIC"}, {"id": 159, "name": "Niger", "code": "NER"}, {
        "id": 160,
        "name": "Nigeria",
        "code": "NGA"
      }, {"id": 161, "name": "Niue", "code": "NIU"}, {"id": 162, "name": "Norfolk Island", "code": "NFK"}, {
        "id": 163,
        "name": "North Korea",
        "code": "PRK"
      }, {"id": 164, "name": "Northern Mariana Islands", "code": "MNP"}, {
        "id": 165,
        "name": "Norway",
        "code": "NOR"
      }, {"id": 166, "name": "Oman", "code": "OMN"}, {"id": 167, "name": "Pakistan", "code": "PAK"}, {
        "id": 168,
        "name": "Palau",
        "code": "PLW"
      }, {"id": 169, "name": "Palestine", "code": "PSE"}, {"id": 170, "name": "Panama", "code": "PAN"}, {
        "id": 171,
        "name": "Papua New Guinea",
        "code": "PNG"
      }, {"id": 172, "name": "Paraguay", "code": "PRY"}, {"id": 173, "name": "Peru", "code": "PER"}, {
        "id": 174,
        "name": "Philippines",
        "code": "PHL"
      }, {"id": 175, "name": "Pitcairn Islands", "code": "PCN"}, {
        "id": 176,
        "name": "Poland",
        "code": "POL"
      }, {"id": 177, "name": "Portugal", "code": "PRT"}, {"id": 178, "name": "Puerto Rico", "code": "PRI"}, {
        "id": 179,
        "name": "Qatar",
        "code": "QAT"
      }, {"id": 180, "name": "Republic of Kosovo", "code": "KOS"}, {
        "id": 181,
        "name": "Réunion",
        "code": "REU"
      }, {"id": 182, "name": "Romania", "code": "ROU"}, {"id": 183, "name": "Russia", "code": "RUS"}, {
        "id": 184,
        "name": "Rwanda",
        "code": "RWA"
      }, {"id": 185, "name": "Saint Barthélemy", "code": "BLM"}, {
        "id": 186,
        "name": "Saint Helena",
        "code": "SHN"
      }, {"id": 187, "name": "Saint Kitts and Nevis", "code": "KNA"}, {
        "id": 188,
        "name": "Saint Lucia",
        "code": "LCA"
      }, {"id": 189, "name": "Saint Martin", "code": "MAF"}, {
        "id": 190,
        "name": "Saint Pierre and Miquelon",
        "code": "SPM"
      }, {"id": 191, "name": "Saint Vincent and the Grenadines", "code": "VCT"}, {
        "id": 192,
        "name": "Samoa",
        "code": "WSM"
      }, {"id": 193, "name": "San Marino", "code": "SMR"}, {
        "id": 194,
        "name": "São Tomé and Príncipe",
        "code": "STP"
      }, {"id": 195, "name": "Saudi Arabia", "code": "SAU"}, {"id": 196, "name": "Senegal", "code": "SEN"}, {
        "id": 197,
        "name": "Serbia",
        "code": "SRB"
      }, {"id": 198, "name": "Seychelles", "code": "SYC"}, {
        "id": 199,
        "name": "Sierra Leone",
        "code": "SLE"
      }, {"id": 200, "name": "Singapore", "code": "SGP"}, {
        "id": 201,
        "name": "Sint Maarten",
        "code": "SXM"
      }, {"id": 202, "name": "Slovakia", "code": "SVK"}, {"id": 203, "name": "Slovenia", "code": "SVN"}, {
        "id": 204,
        "name": "Solomon Islands",
        "code": "SLB"
      }, {"id": 205, "name": "Somalia", "code": "SOM"}, {"id": 206, "name": "South Africa", "code": "ZAF"}, {
        "id": 207,
        "name": "South Georgia",
        "code": "SGS"
      }, {"id": 208, "name": "South Korea", "code": "KOR"}, {
        "id": 209,
        "name": "South Sudan",
        "code": "SSD"
      }, {"id": 210, "name": "Spain", "code": "ESP"}, {"id": 211, "name": "Sri Lanka", "code": "LKA"}, {
        "id": 212,
        "name": "Sudan",
        "code": "SDN"
      }, {"id": 213, "name": "Suriname", "code": "SUR"}, {
        "id": 214,
        "name": "Svalbard and Jan Mayen",
        "code": "SJM"
      }, {"id": 215, "name": "Swaziland", "code": "SWZ"}, {"id": 216, "name": "Sweden", "code": "SWE"}, {
        "id": 217,
        "name": "Switzerland",
        "code": "CHE"
      }, {"id": 218, "name": "Syria", "code": "SYR"}, {"id": 219, "name": "Taiwan", "code": "TWN"}, {
        "id": 220,
        "name": "Tajikistan",
        "code": "TJK"
      }, {"id": 221, "name": "Tanzania", "code": "TZA"}, {"id": 222, "name": "Thailand", "code": "THA"}, {
        "id": 223,
        "name": "East Timor",
        "code": "TLS"
      }, {"id": 224, "name": "Togo", "code": "TGO"}, {"id": 225, "name": "Tokelau", "code": "TKL"}, {
        "id": 226,
        "name": "Tonga",
        "code": "TON"
      }, {"id": 227, "name": "Trinidad and Tobago", "code": "TTO"}, {
        "id": 228,
        "name": "Tunisia",
        "code": "TUN"
      }, {"id": 229, "name": "Turkey", "code": "TUR"}, {"id": 230, "name": "Turkmenistan", "code": "TKM"}, {
        "id": 231,
        "name": "Turks and Caicos Islands",
        "code": "TCA"
      }, {"id": 232, "name": "Tuvalu", "code": "TUV"}, {"id": 233, "name": "Uganda", "code": "UGA"}, {
        "id": 234,
        "name": "Ukraine",
        "code": "UKR"
      }, {"id": 235, "name": "United Arab Emirates", "code": "ARE"}, {
        "id": 236,
        "name": "United Kingdom",
        "code": "GBR"
      }, {"id": 237, "name": "United States", "code": "USA"}, {"id": 238, "name": "Uruguay", "code": "URY"}, {
        "id": 239,
        "name": "Uzbekistan",
        "code": "UZB"
      }, {"id": 240, "name": "Vanuatu", "code": "VUT"}, {"id": 241, "name": "Venezuela", "code": "VEN"}, {
        "id": 242,
        "name": "Vietnam",
        "code": "VNM"
      }, {"id": 243, "name": "Wallis and Futuna", "code": "WLF"}, {
        "id": 244,
        "name": "Western Sahara",
        "code": "ESH"
      }, {"id": 245, "name": "Yemen", "code": "YEM"}, {"id": 246, "name": "Zambia", "code": "ZMB"}, {
        "id": 247,
        "name": "Zimbabwe",
        "code": "ZWE"
      }];

    return Model.bulkCreate(countries, {returning: true});
  };

// Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
