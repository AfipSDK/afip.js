const AfipWebService = require('./AfipWebService');

/**
 * SDK de AFIP para Factura de Crédito Electrónica (wsfecred)
 * 
 * @link https://www.afip.gob.ar/facturadecreditoelectronica/documentos/Manual-Desarrollador-WSFECRED-v1.0.1-rc1.pdf WS Specification
 **/
module.exports = class ElectronicCreditBilling extends AfipWebService {
  constructor(afip) {
    const options = {
      soapV12: false,
      WSDL: "wsfecred-production.wsdl",
      URL: "https://serviciosjava.afip.gob.ar/wsfecred/FECredService",
      WSDL_TEST: "wsfecred.wsdl",
      URL_TEST: "https://fwshomo.afip.gov.ar/wsfecred/FECredService",
      afip
    };
    super(options);
  }

  async aceptarFECred(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        },
        saldoAceptado: data.saldoAceptado,
        codMoneda: data.codMoneda,
        cotizacionMonedaUlt: data.cotizacionMonedaUlt
      };

      if (data.arrayConfirmarNotasDC) {
        Object.assign(params, { arrayConfirmarNotasDC: data.arrayConfirmarNotasDC });
        // [
        //   {
        //     acepta: "",
        //     idNota: {
        //       CUITEmisor: "",
        //       codTipoCmp: "",
        //       ptoVta: "",
        //       nroCmp: ""
        //     }
        //   }
        // ]
      }

      if (data.arrayFormasCancelacion) {
        Object.assign(params, { arrayFormasCancelacion: data.arrayFormasCancelacion });
        // [
        //   {
        //     codigo: "",
        //     descripcion: ""
        //   }
        // ]
      }

      if (data.arrayRetenciones) {
        Object.assign(params, { arrayRetenciones: data.arrayRetenciones });
        // [
        //   {
        //     codTipo: "",
        //     importe: "",
        //     porcentaje: "",
        //     descMotivo: ""
        //   }
        // ]
      }

      if (data.arrayAjustesOperacion) {
        Object.assign(params, { arrayAjustesOperacion: data.arrayAjustesOperacion });
        // [
        //   {
        //     codigo: "",
        //     importe: ""
        //   }
        // ]
      }

      if (data.tipoCancelacion) {
        Object.assign(params, { tipoCancelacion: data.tipoCancelacion });
      }

      if (data.importeCancelado) {
        Object.assign(params, { importeCancelado: data.importeCancelado });
      }

      if (data.importeTotalRetPesos) {
        Object.assign(params, { importeTotalRetPesos: data.importeTotalRetPesos });
      }

      if (data.importeEmbargoPesos) {
        Object.assign(params, { importeEmbargoPesos: data.importeEmbargoPesos });
      }

      res = await this.executeRequest(
        "aceptarFECred",
        "operacionFECredReturn",
        params
      );
      console.log("res");
      console.log(res);
    } catch (e) {
      console.log("e");
      console.log(e);
    }
    return res;
  }

  async rechazarFECred(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        },
        arrayMotivosRechazo: data.arrayMotivosRechazo
          // [
          //   {
          //     codMotivo: "",
          //     descMotivo: "",
          //     justificacion: ""
          //   }
          // ]
      };

      res = await this.executeRequest(
        "rechazarFECred",
        "operacionFECredReturn",
        params
      );
      console.log("res");
      console.log(res);
    } catch (e) {
      console.log("e");
      console.log(e);
    }
    return res;
  }
  
  //TODO arrays
  async rechazarNotaDC(data) {
    let res = "";
    try {
      let params = {
        idComprobante: {
          CUITEmisor: data.CUITEmisor,
          codTipoCmp: data.codTipoCmp,
          ptoVta: data.ptoVta,
          nroCmp: data.nroCmp
        },
        arrayMotivosRechazo: data.arrayMotivosRechazo
          // [
          //   {
          //     codMotivo: "",
          //     descMotivo: "",
          //     justificacion: ""
          //   }
          // ]
      };

      res = await this.executeRequest(
        "rechazarNotaDC",
        "rechazarNotaDCReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async informarFacturaAgtDptoCltv(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        },
        ctaComitente: {
          cuentaDepositante: data.cuentaDepositante,
          subcuentaComitente: data.subcuentaComitente,
          denominacion: data.denominacion
        }
      };

      res = await this.executeRequest(
        "informarFacturaAgtDptoCltv",
        "operacionFECredReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  //TODO arrays
  async informarCancelacionTotalFECred(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        },
        arrayFormasCancelacion: data.arrayFormasCancelacion,
          // [
          //   {
          //     codigo: "",
          //     descripcion: ""
          //   }
          // ],
        importeCancelacion: data.importeCancelacion
      };

      res = await this.executeRequest(
        "informarCancelacionTotalFECred",
        "operacionFECredReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarComprobantes(data) {
    let res = "";
    try {
      let params = {
        rolCUITRepresentada: data.rolCUITRepresentada
      };

      if (data.CUITContraparte)
        Object.assign(params, { CUITContraparte: data.CUITContraparte });
      if (data.codTipoCmp)
        Object.assign(params, { codTipoCmp: data.codTipoCmp });
      if (data.estadoCmp)
        Object.assign(params, { estadoCmp: data.estadoCmp });
      if (data.fecha) Object.assign(params, { fecha: data.fecha });
      if (data.codCtaCte)
        Object.assign(params, { codCtaCte: data.codCtaCte });
      if (data.estadoCtaCte)
        Object.assign(params, { estadoCtaCte: data.estadoCtaCte });

      res = await this.executeRequest(
        "consultarComprobantes",
        "consultarCmpReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarCtasCtes(data) {
    let res = "";
    try {
      let params = {
        rolCUITRepresentada: data.rolCUITRepresentada
      };

      if (data["CUITContraparte"]){
        Object.assign(params, { CUITContraparte: data["CUITContraparte"] });
      }
      if (data["fecha"]) { Object.assign(params, { fecha: data["fecha"] }); } 
      if (data["estadoCtaCte"]) {
        Object.assign(params, { estadoCtaCte: data["estadoCtaCte"] });
      }

      res = await this.executeRequest(
        "consultarCtasCtes",
        "consultarCtasCtesReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarCtaCte(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        }
      };

      res = await this.executeRequest(
        "consultarCtaCte",
        "consultarCtaCteReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarCuentasComitente() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarCuentasComitente",
        "consultarCuentasComitenteReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  //Deprecado, reemplazado por consultarMontoObligadoRecepcion
  async consultarObligadoRecepcion(data) {
    let res = "";
    try {
      let params = {
        cuitConsultada: data.cuitConsultada
      };
      res = await this.executeRequest(
        "consultarObligadoRecepcion",
        "consultarObligadoRecepcionReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }
  async consultarMontoObligadoRecepcion(data) {
    let res = "";
    try {
      let params = {
        cuitConsultada: data.cuitConsultada,
        fechaEmision: data.fechaEmision
      };
      res = await this.executeRequest(
        "consultarMontoObligadoRecepcion",
        "consultarMontoObligadoRecepcionReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarTiposRetenciones() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarTiposRetenciones",
        "consultarTiposRetencionesReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarTiposMotivosRechazo() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarTiposMotivosRechazo",
        "codigoDescripcionReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarFacturasAgtDptoCltv() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarFacturasAgtDptoCltv",
        "consultarFacturasAgtDptoCltvReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarTiposFormasCancelacion() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarTiposFormasCancelacion",
        "codigoDescripcionReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async obtenerRemitos(data) {
    let res = "";
    try {
      let params = {
        idComprobante: {
          CUITEmisor: data.CUITEmisor,
          codTipoCmp: data.codTipoCmp,
          ptoVta: data.ptoVta,
          nroCmp: data.nroCmp
        }
      };

      res = await this.executeRequest(
        "obtenerRemitos",
        "obtenerRemitosReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarHistorialEstadosComprobante(data) {
    let res = "";
    try {
      let params = {
        idComprobante: {
          CUITEmisor: data.CUITEmisor,
          codTipoCmp: data.codTipoCmp,
          ptoVta: data.ptoVta,
          nroCmp: data.nroCmp
        }
      };

      res = await this.executeRequest(
        "consultarHistorialEstadosComprobante",
        "consultarHistorialEstadosComprobanteReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarHistorialEstadosCtaCte(data) {
    let res = "";
    try {
      let params = {
        idCtaCte: {
          codCtaCte: data.codCtaCte,
          idFactura: data.idFactura
        }
      };

      res = await this.executeRequest(
        "consultarHistorialEstadosCtaCte",
        "consultarHistorialEstadosCtaCteReturn",
        params
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  async consultarTiposAjustesOperacion() {
    let res = "";
    try {
      res = await this.executeRequest(
        "consultarTiposAjustesOperacion",
        "codigoDescripcionReturn"
      );
    } catch (e) {
      res = e;
    }
    return res;
  }

  /**
   * Asks to web service for servers status {@see WS
   * Specification item 4.14}
   *
   * @return object { AppServer : Web Service status,
   * DbServer : Database status, AuthServer : Autentication
   * server status}
   **/
  async getServerStatus() {
    return await this.executeRequest("dummy", "return");
  }

  /**
   * Change date from AFIP used format (yyyymmdd) to yyyy-mm-dd
   *
   * @param string|int date to format
   *
   * @return string date in format yyyy-mm-dd
   **/
  formatDate(date) {
    return date
      .toString()
      .replace(
        /(\d{4})(\d{2})(\d{2})/,
        (string, year, month, day) => `${year}-${month}-${day}`
      );
  }

  /**
   * Sends request to AFIP servers
   *
   * @param string 	operation 	SOAP operation to do
   * @param array 	params 	Parameters to send
   *
   * @return mixed Operation results
   **/
  async executeRequest(operation, operationResult, params = {}) {
    let paramsAuth = Object.assign(
      await this.getWSInitialRequest(operation),
      params
    );
    try {
      console.log("params");
      console.log(params);
      const results = await super.executeRequest(operation, paramsAuth);
      console.log("results");
      console.log(results);
      // await this._checkErrors(operation, results);

      return results[operationResult];
    } catch (e) {
      console.log("e");
      console.log(e);
    }
  }

  /**
   * Make default request parameters for most of the operations
   *
   * @param string operation SOAP Operation to do
   *
   * @return array Request parameters
   **/
  async getWSInitialRequest(operation) {
    if (operation === "dummy") {
      return {};
    }

    const { token, sign } = await this.afip.GetServiceTA("wsfecred");

    return {
      authRequest: {
        token: token,
        sign: sign,
        cuitRepresentada: this.afip.CUIT
      }
    };
  }

  /**
   * Check if occurs an error on Web Service request
   *
   * @param string 	operation 	SOAP operation to check
   * @param mixed 	results 	AFIP response
   *
   * @throws Exception if exists an error in response
   *
   * @return void
   **/
  async _checkErrors(operation, results) {
    const res = results[operation + "Result"];

    if (res.Errors) {
      const err = Array.isArray(res.Errors.Err)
        ? res.Errors.Err[0]
        : res.Errors.Err;
      throw new Error(`(${err.Code}) ${err.Msg}`, err.Code);
    }
  }
};

