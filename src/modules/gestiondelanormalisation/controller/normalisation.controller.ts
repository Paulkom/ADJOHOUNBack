/*import { ValidationError, validate } from "class-validator";
import axios from 'axios';
import { myDataSource } from "../../../../src/configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../../src/configs/response"
import { Brackets } from "typeorm";
import { Response, Request } from "express";
import { paginationAndRechercheInit } from "../../../../src/configs/paginationAndRechercheInit";
//import { Facture } from "../../gestiondesplace/entity/facture.entity";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
require("dotenv").config();

// const elementRepository = myDataSource.getRepository(Element);
const myToken = process.env.MECEF_API_TOKEN;
const myNim = process.env.MECEF_API_NIM;
const myIFU = process.env.MECEF_API_IFU;
const myHost = process.env.MECEF_API_HOST;
let items: InvoiceItem[] = [];
let datas: InvoiceRequestDto;
let operateur = null;
let facture = null;

export interface InvoiceRequestDto {
  ifu: string;
  type: string;
  aib: string;
  reference: string;
  items: InvoiceItem[];
  operator: {
    name: string;
  };
  client: {
    name: string;
    address: string;
    ifu: string;
    contact: string;
  };
  payment:[ 
    { 
      name:string
    } 
  ];
}

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  taxGroup: string;
  taxSpecific: number;
}

export const testNormalisation = async (req: Request, res: Response) => {
  try {
    const data : InvoiceRequestDto = req.body.data;
    const result = await normalisation(data);
    console.log("RESULTAT", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error during test normalisation:', error);
    return res.status(500).json({ message: error.message });
  }

};


export const normalisation = async (data: any = null) => {
  try {
    const infoResponse = await getInfoReponseDto();
    const statusResponse = await getStatusResponseDto(data);
    return statusResponse;

  } catch (error) {
    console.error('Error during normalisation:', error);
    throw new Error(`Failed to perform normalisation: ${error.message}`);
  }

};


export const putFinalize = async (uid: string): Promise<any> => {
  try {
    const response = await axios.put(`${myHost}/invoice/${uid}/confirm`, {}, {
      headers: { 'Authorization': myToken }
    });

    if (response.status === 200) {
      return {
        message: 'Finalize successful',
        data: response.data
      };
    }


  } catch (error) {
    console.error('Error finalizing:', error);
    throw new Error(`Failed to finalize: ${error.message}`);
  }
};

export const getInvoiceDetailsDto = async (uid: string): Promise<any> => {
  try {
    const response = await axios.get(`${myHost}/invoice/${uid}`, {
      headers: {
        'Authorization': myToken
      }
    });

    if (response.status === 200) {
      const result = await putFinalize(uid);
      return result;
    }

    return {
      message: 'InvoiceDetailsDto retrieved successfully',
      data: response.data
    };

  } catch (error) {
    console.error('Error retrieving InvoiceDetailsDto:', error);
    throw new Error(`Failed to retrieve InvoiceDetailsDto: ${error.message}`);
  }
};

export const postInvoiceRequestDto = async (datas: InvoiceRequestDto): Promise<any> => {
  const myhost = `${myHost}/invoice`;
  try {
    const invoiceRequestDto: InvoiceRequestDto = {
      ifu: myIFU,
      type: datas.type,
      items: datas.items,
      operator: datas.operator,
      client: datas.client,
      aib: datas.aib,
      reference: datas.reference && datas.reference.length > 0 ? datas.reference : null,
      payment: datas.payment && Array.isArray(datas.payment) ? datas.payment : [{ name: "ESPECES" }]
    };

    const response = await axios.post(myhost, invoiceRequestDto, {
      headers: {
        'Authorization': myToken
      }
    });

    if (response.status) {
      const result = await getInvoiceDetailsDto(response.data.uid);
      return result;
    }

    return {
      message: 'InvoiceResponseDto retrieved successfully',
      data: response.data
    };


  } catch (error) {
    console.error('Error retrieving InvoiceResponseDto', error);
    throw new Error(`Failed to retrieve InvoiceResponseDto: ${error.message}`);
  }
}

export const getStatusResponseDto = async (dat: InvoiceRequestDto): Promise<any> => {
  try {
    const response = await axios.get(`${myHost}/invoice`, {
      headers: { 'Authorization': myToken }
    });

    if (response.data.status) {
      const result = await postInvoiceRequestDto(dat);
      return result;
    }

    return {
      message: 'StatusResponseDto retrieved successfully',
      data: response.data
    };


  } catch (error) {
    console.error('Error retrieving StatusResponseDto:', error);
    throw new Error(`Failed to retrieve StatusResponseDto: ${error.message}`);
  }
};

//####

export const getPaymentTypesDto = async (): Promise<any> => {
  // Les types de facture FV, FA, EV, EA
  try {
    const response = await axios.get(`${myHost}/info/invoiceTypes`, {
      headers: { 'Authorization': myToken }
    });

    return {
      message: 'PaymentTypesDto retrieved successfully',
      data: response.data
    };

  } catch (error) {
    console.error('Error retrieving PaymentTypesDto:', error);
    throw new Error(`Failed to retrieve PaymentTypesDto: ${error.message}`);
  }
};

export const getTaxGroupsDto = async (): Promise<any> => {
  try {
    const response = await axios.get(`${myHost}/info/taxGroups`, {
      headers: { 'Authorization': myToken }
    });

    if (response.status === 200) {
      const result = await getPaymentTypesDto();
      return response.data;
    }

    return {
      message: 'TaxGroupsDto retrieved successfully',
      data: response.data
    };


  } catch (error) {
    console.error('Error retrieving TaxGroupsDto:', error);
    throw new Error(`Failed to retrieve TaxGroupsDto: ${error.message}`);
  }
};

export const getInvoiceTypesDto = async (): Promise<any> => {
  try {
    const response = await axios.get(`${myHost}/info/invoiceTypes`, {
      headers: { 'Authorization': myToken }
    });

    if (response.status === 200) {
      const result = await getTaxGroupsDto();
      return response.data;
    }

    return {
      message: 'InvoiceTypesDto retrieved successfully',
      data: response.data
    };

  } catch (error) {

    console.error('Error retrieving InvoiceTypesDto:', error);
    throw new Error(`Failed to retrieve InvoiceTypesDto: ${error.message}`);
  }
};

export const getInfoReponseDto = async (): Promise<any> => {
  try {
    
    // console.log("myHost", myHost);
    // console.log("RESSOURCE ====> ", `${myHost}/info/status`, {
    //   headers: { 'Authorization': myToken }});
    const response = await axios.get(`${myHost}/info/status`, {
      headers: { 'Authorization': myToken }
    });

    // console.log("response", response);
    if (response.status === 404) {
      throw new Error('Resource not found');
    }



    if (response.data.status) {
      const result = await getInvoiceTypesDto();
      console.log("RESULT INFO", response.data);
      return result;
    }
    console.log("Retour inforResponseDto", response);
    return {
      message: 'InfoReponseDto retrieved successfully',
      
      data: response.data
    };


  } catch (error) {
    console.error('Error retrieving InfoReponseDto:', error);
    throw new Error(`Failed to retrieve InfoReponseDto: ${error.message}`);
  }
};
*/



