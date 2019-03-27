import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import withWidth from "@material-ui/core/withWidth";
import "@UI/transitions.css";

import styles from "./styles";

//Router
import { withRouter } from "react-router-dom";

//REDUX
import { connect } from "react-redux";
import { push, goBack } from "connected-react-router";
import { login } from "@Redux/Actions/usuario";
import { mostrarAlertaVerde, mostrarAlertaNaranja, mostrarAlertaRoja } from "@Redux/Actions/alerta";

//Componentes
import _ from "lodash";
import loadImage from "blueimp-load-image";
import memoizeOne from "memoize-one";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputAdornment from "@material-ui/core/InputAdornment";
import ButtonBase from "@material-ui/core/ButtonBase";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import IconButton from "@material-ui/core/IconButton";
import IconEditOutlined from "@material-ui/icons/EditOutlined";
import IconArrowBackOutlined from "@material-ui/icons/ArrowBackOutlined";
import IconHelpOutlined from "@material-ui/icons/HelpOutlineOutlined";
import { Element, scroller } from "react-scroll";

//Mis componentes
import Validador from "@Componentes/Utils/Validador";
import MiPanelMensaje from "@Componentes/MiPanelMensaje";
import MiBaner from "@Componentes/MiBaner";
import MiItemDetalle from "@Componentes/MiItemDetalle";
import MiSelect from "@Componentes/MiSelect";
import MiDialogoInput from "@Componentes/MiDialogoInput";
import MiDialogoMensaje from "@Componentes/MiDialogoMensaje";
import CordobaFilesUtils from "@Componentes/Utils/CordobaFiles";
import StringUtils from "@Componentes/Utils/String";
import FotoUtils from "@Componentes/Utils/Foto";
import MenuApps from "../MenuApps";
import DialogoNumeroTramiteAyuda from "../_Dialogos/DialogoNumeroTramiteAyuda";

//Mis Rules
import Rules_Usuario from "@Rules/Rules_Usuario";
import Rules_Barrios from "@Rules/Rules_Barrios";

import Provincias from "./_provincias";
import Ciudades from "./_ciudades";

const CIUDAD_CORDOBA = 543;
const FOTO_PERFIL_MAX = 1000;
const FOTO_DNI_MAX = 1000;

const mapDispatchToProps = dispatch => ({
  mostrarAlertaVerde: comando => {
    dispatch(mostrarAlertaVerde(comando));
  },
  mostrarAlertaNaranja: comando => {
    dispatch(mostrarAlertaNaranja(comando));
  },
  mostrarAlertaRoja: comando => {
    dispatch(mostrarAlertaRoja(comando));
  },
  redireccionar: url => {
    dispatch(push(url));
  },
  goBack: () => {
    dispatch(goBack());
  },
  login: usuario => {
    dispatch(login(usuario));
  }
});

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

class Perfil extends React.Component {
  constructor(props) {
    super(props);

    const urlParams = new URLSearchParams(props.location.search);
    const seccion = urlParams.get("seccion");
    const seccionMensaje = urlParams.get("seccionMensaje") || "Por favor complete los datos de esta sección";

    let provincias = _.orderBy(Provincias, "nombre").map(item => {
      return { value: item.id, label: StringUtils.toTitleCase(item.nombre) };
    });

    this.state = {
      token: urlParams.get("token"),
      url: urlParams.get("url"),
      visible: false,
      errorVisible: false,
      errorMensaje: "",
      seccion: seccion,
      seccionMensaje: seccionMensaje,

      provincias: provincias,
      ciudades: [],
      barrios: [],
      idProvincia: -1,
      idCiudad: -1,
      idBarrio: -2,
      estadosCiviles: [],
      ocupaciones: [],
      estudiosAlcanzados: [],
      //Form
      identificadorFotoPersonal: undefined,
      numeroTramite: "",
      datosDeContacto: {},
      datosDeDomicilio: {},
      datosExtra: {},
      errores: {
        contacto: {},
        domicilio: {},
        datosExtra: {}
      },
      fotoDNIFrente: undefined,
      fotoDNIReverso: undefined,
      //Dialogo error
      dialogoErrorVisible: false,
      errorDialogo: undefined,
      //Dialogo Username
      dialogoUsernameVisible: false,
      dialogoUsernameCargando: false,
      dialogoUsernameBanerTexto: "",
      dialogoUsernameMostrarBaner: false,
      dialogoUsernameCargando: false,
      //Dialogo password
      dialogoPasswordVisible: false,
      dialogoPasswordCargando: false,
      dialogoPasswordBanerTexto: "",
      dialogoPasswordMostrarBaner: false,
      dialogoPasswordPasswordNueva: "",
      dialogoPasswordPasswordNuevaRepeat: "",
      //UI
      contenedorFotoVisible: false,
      cardDatosPersonalesVisible: false,
      cardDatosDeAccesoVisible: false,
      cardDatosDeContactoVisible: false,
      cardDatosDomicilioVisible: false
    };
  }

  componentDidMount() {
    this.buscarDatos();
  }

  componentWillReceiveProps(nextProps) {
    const urlParams = new URLSearchParams(nextProps.location.search);
    if (urlParams.get("token") != this.state.token) {
      window.location.reload();
    } else {
      const seccion = urlParams.get("seccion");
      if (seccion && seccion != this.state.seccion) {
        this.setState({ seccion: seccion });
        this.scrollTo(seccion);
      }

      const seccionMensaje = urlParams.get("seccionMensaje") || "Por favor complete los datos de esta sección";
      if (seccionMensaje != this.state.seccionMensaje) {
        this.setState({ seccionMensaje: seccionMensaje });
      }
    }
  }

  scrollTo = (seccion, duration) => {
    scroller.scrollTo(seccion, {
      containerId: "containerId",
      duration: duration || 800,
      delay: 0,
      smooth: "easeInOutQuart"
    });
  };

  buscarDatos = async () => {
    this.setState({ cargando: true });
    await this.buscarDatosIniciales();
    this.validarToken();
  };

  buscarDatosIniciales = async () => {
    let estadosCiviles = await Rules_Usuario.getEstadosCiviles();
    let ocupaciones = await Rules_Usuario.getOcupaciones();
    let estudiosAlcanzados = await Rules_Usuario.getEstudiosAlcanzados();
    estudiosAlcanzados = _.orderBy(estudiosAlcanzados, "id");
    estudiosAlcanzados = estudiosAlcanzados.map((item, index) => {
      return {
        ...item,
        nombre: index + 1 + " | " + item.nombre
      };
    });

    let barrios = await Rules_Barrios.get();
    barrios = _.orderBy(barrios, "nombre").map(item => {
      return { value: item.id, label: StringUtils.toTitleCase(item.nombre) };
    });

    this.setState({
      barrios: barrios,
      estudiosAlcanzados: estudiosAlcanzados,
      ocupaciones: ocupaciones,
      estadosCiviles: estadosCiviles
    });
  };

  validarToken = async () => {
    this.setState(
      {
        cargando: true,
        errorVisible: false
      },
      async () => {
        try {
          let data = await Rules_Usuario.getDatos(this.state.token);
          let fotos = await Rules_Usuario.getFotosDNI(this.state.token);

          if (this.state.meVoy == true) return;

          if (data.ValidacionRenaper === false) {
            this.setState({
              visible: true,
              cargando: false,
              errorVisible: true,
              errorMensaje: "Su usuario no se encuentra validado por el Registro Nacional de las Personas"
            });
            return;
          }

          if (data.telefonoFijo) {
            let telefonoFijo = data.telefonoFijo;
            if (telefonoFijo.indexOf("-") != -1) {
              data.telefonoFijoCaracteristica = telefonoFijo.split("-")[0];
              data.telefonoFijoNumero = telefonoFijo.split("-")[1];
            }
          }

          if (data.telefonoCelular) {
            let telefonoCelular = data.telefonoCelular;
            if (telefonoCelular.indexOf("-") != -1) {
              data.telefonoCelularCaracteristica = telefonoCelular.split("-")[0];
              data.telefonoCelularNumero = telefonoCelular.split("-")[1];
            }
          }

          let ciudades = [];
          if (data.domicilioProvinciaId != undefined) {
            ciudades = _.filter(Ciudades, ciudad => {
              return ciudad.id_provincia == data.domicilioProvinciaId;
            }).map(ciudad => {
              return {
                value: ciudad.id,
                label: StringUtils.toTitleCase(ciudad.nombre)
              };
            });
          }

          this.props.login(data);

          this.setState({
            visible: true,
            cargando: false,
            identificadorFotoPersonal: data.identificadorFotoPersonal,
            ciudades: ciudades,
            fotoDNIFrente: fotos.identificadorFotoDNIFrente,
            fotoDNIReverso: fotos.identificadorFotoDNIReverso,
            datosDeContacto: {
              email: data.email,
              telefonoCelularCaracteristica: data.telefonoCelularCaracteristica,
              telefonoCelularNumero: data.telefonoCelularNumero,
              telefonoFijoCaracteristica: data.telefonoFijoCaracteristica,
              telefonoFijoNumero: data.telefonoFijoNumero,
              facebook: data.facebook,
              twitter: data.twitter,
              instagram: data.instagram,
              linkedIn: data.linkedIn
            },
            datosDeDomicilio: {
              esCordoba: data.domicilioCiudadId == CIUDAD_CORDOBA,
              direccion: data.domicilioDireccion,
              altura: data.domicilioAltura,
              torre: data.domicilioTorre,
              piso: data.domicilioPiso,
              depto: data.domicilioDepto,
              idProvincia: data.domicilioProvinciaId,
              idCiudad: data.domicilioCiudadId,
              idBarrio: data.domicilioBarrioId
            },
            datosExtra: {
              idEstudioAlcanzado: data.estudioAlcanzadoId || undefined,
              idOcupacion: data.ocupacionId || undefined,
              idEstadoCivil: data.estadoCivilId || undefined,
              cantidadHijos: data.cantidadHijos != null ? data.cantidadHijos : ""
            },
            contenedorFotoVisible: true
          });

          setTimeout(() => {
            this.setState({ cardDatosPersonalesVisible: true });
          }, 300);
          setTimeout(() => {
            this.setState({ cardDatosValidacionVisible: true });
          }, 500);
          setTimeout(() => {
            this.setState({ cardDatosDeAccesoVisible: true });
          }, 700);
          setTimeout(() => {
            this.setState({ cardDatosDeContactoVisible: true });
          }, 900);
          setTimeout(() => {
            this.setState({ cardDatosDomicilioVisible: true });
          }, 1100);
          setTimeout(() => {
            this.setState({ cardDatosExtraVisible: true });
          }, 1300);

          setTimeout(() => {
            if (this.state.seccion) {
              this.scrollTo(this.state.seccion);
            }
          }, 500);
        } catch (ex) {
          this.setState({
            visible: true,
            cargando: false,
            errorVisible: true,
            errorMensaje: typeof ex === "object" ? ex.message : ex
          });
        }
      }
    );
  };

  onFilePickerRef = ref => {
    this.filePicker = ref;
  };

  onFilePickerFotoDNIFrenteRef = ref => {
    this.filePickerFotoDNIFrente = ref;
  };

  onFilePickerFotoDNIReversoRef = ref => {
    this.filePickerFotoDNIReverso = ref;
  };

  onDatosCambiados = () => {
    const urlParams = new URLSearchParams(this.props.location.search);
    const url = urlParams.get("redirect");
    if (url) {
      this.setState({ meVoy: true, visible: false });
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    }
  };

  onFile = evt => {
    var files = evt.target.files; // FileList object
    if (files.length != 1) return;

    var file = files[0];

    this.setState({ cargando: true }, () => {
      loadImage(
        file,
        async canvas => {
          this.filePicker.value = "";
          let foto = canvas.toDataURL("image/png", 0.7);

          try {
            await Rules_Usuario.cambiarFotoPerfil({
              token: this.state.token,
              base64: foto
            });

            this.setState({ cargando: false });
            this.props.mostrarAlertaVerde({ texto: "Foto de perfil modificada correctamente" });
            this.onDatosCambiados();
            this.validarToken();
          } catch (ex) {
            let mensaje = typeof ex === "object" ? ex.message : ex;
            this.mostrarDialogoError(mensaje);
            this.setState({ cargando: false });
          }
        },
        { maxWidth: FOTO_PERFIL_MAX, orientation: true, canvas: true }
      );
    });
  };

  onBotonBackClick = () => {
    this.setState({ visible: false });
    setTimeout(() => {
      this.props.goBack();
    }, 500);
  };

  onBotonSeleccionarFotoClick = () => {
    if (this.filePicker) {
      this.filePicker.value = "";
      this.filePicker.click();
    }
  };

  onCargando = cargando => {
    this.setState({ cargando: cargando });
  };

  convertirFechaStringToDate = fecha => {
    let año = fecha.split("T")[0].split("-")[0];
    let mes = parseInt(fecha.split("T")[0].split("-")[1]) - 1;
    let dia = fecha.split("T")[0].split("-")[2];

    return new Date(año, mes, dia);
  };

  convertirFechaNacimientoString = fecha => {
    let dia = fecha.getDate();
    if (dia < 10) dia = "0" + dia;
    let mes = fecha.getMonth() + 1;
    if (mes < 10) mes = "0" + mes;
    let año = fecha.getFullYear();
    return dia + "/" + mes + "/" + año;
  };

  onBotonReintentarClick = () => {
    this.validarToken();
  };

  // onBotonRedirigirClick = () => {
  //   let { url } = this.state;
  //   if (url) {
  //     if (url.indexOf("?") != -1) {
  //       url += "&token=" + this.state.token;
  //     } else {
  //       url += "?token=" + this.state.token;
  //     }
  //   }
  //   window.location.href = url;
  // };

  onToolbarLeftIconClick = () => {
    this.props.goBack();
  };

  onToolbarTituloClick = () => {};

  mostrarDialogoUsername = () => {
    this.setState({ dialogoUsernameVisible: true, dialogoUsernameCargando: false, dialogoUsernameMostrarBaner: false });
  };

  onDialogoUsernameClose = () => {
    if (this.state.dialogoUsernameCargando === true) return;

    this.setState({ dialogoUsernameVisible: false });
  };

  cambiarUsername = username => {
    this.setState({ dialogoUsernameCargando: true, dialogoUsernameMostrarBaner: false }, () => {
      Rules_Usuario.cambiarUsername({
        token: this.state.token,
        username: username
      })
        .then(() => {
          this.setState({ dialogoUsernameVisible: false });
          this.props.mostrarAlertaVerde({ texto: "Nombre de usuario modificado correctamente" });
          this.validarToken();
          this.onDatosCambiados();
        })
        .catch(error => {
          this.setState({ dialogoUsernameMostrarBaner: true, dialogoUsernameBanerTexto: error });
        })
        .finally(() => {
          this.setState({ dialogoUsernameCargando: false });
        });
    });
  };

  onDialogoUsernameBotonBanerClick = () => {
    this.setState({ dialogoUsernameMostrarBaner: false });
  };

  mostrarDialogoPassword = () => {
    this.setState({
      dialogoPasswordVisible: true,
      dialogoPasswordMostrarBaner: false,
      dialogoPasswordPasswordNueva: "",
      dialogoPasswordPasswordNuevaRepeat: ""
    });
  };

  onDialogoPasswordClose = () => {
    if (this.state.dialogoPasswordCargando === true) return;
    this.setState({ dialogoPasswordVisible: false });
  };

  cambiarPassword = passwordActual => {
    let pass = this.state.dialogoPasswordPasswordNueva;
    let passRepeat = this.state.dialogoPasswordPasswordNuevaRepeat;

    if (passwordActual === "") {
      this.setState({ dialogoPasswordMostrarBaner: true, dialogoPasswordBanerTexto: "Ingrese su contraseña actual" });
      return;
    }

    if (pass === "") {
      this.setState({ dialogoPasswordMostrarBaner: true, dialogoPasswordBanerTexto: "Ingrese su nueva contraseña" });
      return;
    }

    if (passRepeat === "") {
      this.setState({ dialogoPasswordMostrarBaner: true, dialogoPasswordBanerTexto: "Ingrese su nueva contraseña" });
      return;
    }

    if (pass !== passRepeat) {
      this.setState({ dialogoPasswordMostrarBaner: true, dialogoPasswordBanerTexto: "Las contraseñas ingresadas no coinciden" });
      return;
    }

    this.setState({ dialogoPasswordCargando: true, dialogoPasswordMostrarBaner: false }, () => {
      Rules_Usuario.cambiarPassword({
        token: this.state.token,
        passwordAnterior: passwordActual,
        passwordNueva: pass
      })
        .then(() => {
          this.setState({ dialogoPasswordVisible: false });
          this.props.mostrarAlertaVerde({ texto: "Contraseña modificada correctamente" });
          this.onDatosCambiados();
        })
        .catch(error => {
          this.setState({ dialogoPasswordMostrarBaner: true, dialogoPasswordBanerTexto: error });
        })
        .finally(() => {
          this.setState({ dialogoPasswordCargando: false });
        });
    });
  };

  onDialogoPasswordBotonBanerClick = () => {
    this.setState({ dialogoPasswordMostrarBaner: false });
  };

  onDialogoPasswordInputChange = e => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  };

  onDialogoPasswordInputKeyPress = e => {};

  onBotonGuardarCambiosDatosDeContactoClick = () => {
    let { datosDeContacto, errores } = this.state;
    let {
      email,
      telefonoCelularCaracteristica,
      telefonoCelularNumero,
      telefonoFijoCaracteristica,
      telefonoFijoNumero,
      facebook,
      twitter,
      linkedIn,
      instagram
    } = datosDeContacto;

    let erroresContacto = {};

    //Email
    erroresContacto["email"] = Validador.validar(
      [Validador.requerido, Validador.min(email, 5), Validador.max(email, 40), Validador.email],
      email
    );

    //Telefono celular caracteristica
    erroresContacto["telefonoCelularCaracteristica"] = Validador.validar(
      [Validador.numericoEntero, Validador.min(telefonoCelularCaracteristica, 2), Validador.max(telefonoCelularCaracteristica, 4)],
      telefonoCelularCaracteristica
    );

    //Telefono celular numero
    erroresContacto["telefonoCelularNumero"] = Validador.validar(
      [Validador.numericoEntero, Validador.min(telefonoCelularNumero, 4), Validador.max(telefonoCelularNumero, 8)],
      telefonoCelularNumero
    );

    if (telefonoCelularCaracteristica == undefined) telefonoCelularCaracteristica = "";
    if (telefonoCelularNumero == undefined) telefonoCelularNumero = "";

    //Si no tiene errores en el telefono valido que si ingreso uno de los 2, este el otro
    if (erroresContacto["telefonoCelularCaracteristica"] == undefined && erroresContacto["telefonoCelularNumero"] == undefined) {
      if ((telefonoCelularCaracteristica != "") != (telefonoCelularNumero != "")) {
        erroresContacto[telefonoCelularCaracteristica != "" ? "telefonoCelularNumero" : "telefonoCelularCaracteristica"] = "Dato requerido";
      }
    }

    // Telefono Fijo

    //Fijo Area
    erroresContacto["telefonoFijoCaracteristica"] = Validador.validar(
      [Validador.min(telefonoFijoCaracteristica, 2), Validador.max(telefonoFijoCaracteristica, 4), Validador.numericoEntero],
      telefonoFijoCaracteristica
    );

    //Fijo numero
    erroresContacto["telefonoFijoNumero"] = Validador.validar(
      [Validador.min(telefonoFijoNumero, 4), Validador.max(telefonoFijoNumero, 8), Validador.numericoEntero],
      telefonoFijoNumero
    );

    if (telefonoFijoNumero == undefined) telefonoFijoNumero = "";
    if (telefonoFijoCaracteristica == undefined) telefonoFijoCaracteristica = "";

    //Si no tiene errores en el telefono valido que si ingreso uno de los 2, este el otro
    if (erroresContacto["telefonoFijoCaracteristica"] == undefined && erroresContacto["telefonoFijoNumero"] == undefined) {
      if ((telefonoFijoCaracteristica != "") != (telefonoFijoNumero != "")) {
        erroresContacto[telefonoFijoCaracteristica != "" ? "telefonoFijoNumero" : "telefonoFijoCaracteristica"] = "Dato requerido";
      }
    }

    this.setState({ errores: { ...errores, contacto: erroresContacto } });

    let conError = false;
    for (var prop in erroresContacto) {
      if (erroresContacto.hasOwnProperty(prop) && erroresContacto[prop] != undefined) {
        conError = true;
      }
    }

    if (conError) return;

    //Valido que tenga algun telefono de contacto
    if (
      (telefonoFijoCaracteristica == undefined || telefonoFijoNumero == "") &&
      (telefonoCelularCaracteristica == undefined || telefonoCelularNumero == "")
    ) {
      this.mostrarDialogoError("Ingrese algun teléfono de contacto");
      return;
    }

    let telefonoFijo = "";
    if (telefonoFijoCaracteristica && telefonoFijoCaracteristica != "") {
      telefonoFijo = telefonoFijoCaracteristica + "-" + telefonoFijoNumero;
    }
    let telefonoCelular = "";
    if (telefonoCelularCaracteristica && telefonoCelularCaracteristica != "") {
      telefonoCelular = telefonoCelularCaracteristica + "-" + telefonoCelularNumero;
    }

    this.setState(
      {
        cargando: true
      },
      () => {
        Rules_Usuario.actualizarDatosContacto({
          token: this.state.token,
          email: email,
          telefonoFijo: telefonoFijo,
          telefonoCelular: telefonoCelular,
          facebook: facebook,
          twitter: twitter,
          linkedIn: linkedIn,
          instagram,
          instagram
        })
          .then(() => {
            this.props.mostrarAlertaVerde({ texto: "Datos de contacto modificados correctamente" });
            this.validarToken();
            this.onDatosCambiados();
          })
          .catch(error => {
            this.mostrarDialogoError(error);
          })
          .finally(() => {
            this.setState({ cargando: false });
          });
      }
    );
  };

  onDatosDeContactoInputChange = e => {
    let { datosDeContacto, errores } = this.state;
    datosDeContacto = datosDeContacto || {};
    datosDeContacto[e.currentTarget.name] = e.currentTarget.value;

    let erroresContacto = errores.contacto || {};
    erroresContacto[e.currentTarget.name] = undefined;
    this.setState({ datosDeContacto: datosDeContacto, errores: { ...errores, contacto: erroresContacto } });
  };

  onDatosDeContactoInputKeyPress = e => {
    if (e.key === "Enter") {
      this.onBotonGuardarCambiosDatosDeContactoClick();
    }
  };

  mostrarDialogoError = error => {
    this.setState({ dialogoErrorVisible: true, errorDialogo: error });
  };

  onDialogoErrorClose = () => {
    this.setState({ dialogoErrorVisible: false });
  };

  onDatosDeDomicilioInputChange = e => {
    let datos = this.state.datosDeDomicilio || {};
    let errores = this.state.errores.domicilio;
    errores[e.currentTarget.name] = undefined;

    datos[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ datosDeDomicilio: datos, errores: { ...this.state.errores, domicilio: errores } });
  };

  onDatosDeDomicilioInputKeyPress = e => {
    if (e.key == "Enter") {
      this.onBotonGuardarCambiosDatosDomicilioClick();
    }
  };

  onBotonGuardarCambiosDatosDomicilioClick = () => {
    let { datosDeDomicilio, errores } = this.state;
    let { direccion, altura, torre, piso, depto, idProvincia, idCiudad, idBarrio } = datosDeDomicilio;
    let erroresDomicilio = {};

    let domicilioRequerido =
      (direccion && direccion.trim() != "") ||
      (altura && altura.trim() != "") ||
      (torre && torre.trim() != "") ||
      (piso && piso.trim() != "") ||
      (depto && depto.trim() != "") ||
      (idCiudad && idCiudad != -1) ||
      (idProvincia && idProvincia != -1) ||
      (idBarrio && idBarrio != -2);

    if (domicilioRequerido) {
      erroresDomicilio["direccion"] = Validador.validar(
        [Validador.requerido, Validador.min(direccion, 5), Validador.max(direccion, 100)],
        direccion
      );

      erroresDomicilio["altura"] = Validador.validar([Validador.max(altura, 10)], altura);

      if (idProvincia == undefined || idProvincia == -1) {
        erroresDomicilio["provincia"] = "Dato requerido";
      }

      if (idCiudad == undefined || idCiudad == -1) {
        erroresDomicilio["ciudad"] = "Dato requerido";
      }

      if (idCiudad == CIUDAD_CORDOBA && (idBarrio == undefined || idBarrio == -2)) {
        erroresDomicilio["barrio"] = "Dato requerido";
      }
    }

    this.setState({ errores: { ...errores, domicilio: erroresDomicilio } });
    let conError = false;
    for (var prop in erroresDomicilio) {
      if (erroresDomicilio.hasOwnProperty(prop) && erroresDomicilio[prop] != undefined) {
        conError = true;
      }
    }

    if (conError) return;

    direccion = direccion == undefined || direccion.trim() == "" ? "" : direccion.trim();
    altura = altura == undefined || altura.trim() == "" ? "" : altura.trim();
    torre = torre == undefined || torre.trim() == "" ? "" : torre.trim();
    piso = piso == undefined || piso.trim() == "" ? "" : piso.trim();
    depto = depto == undefined || depto.trim() == "" ? "" : depto.trim();
    idProvincia = idProvincia == undefined || idProvincia == -1 ? undefined : idProvincia;
    let provincia = idProvincia ? StringUtils.toTitleCase(_.find(Provincias, item => item.id == idProvincia).nombre.trim()) : undefined;
    idCiudad = idCiudad == undefined || idCiudad == -1 ? undefined : idCiudad;
    let ciudad = idCiudad ? StringUtils.toTitleCase(_.find(Ciudades, item => item.id == idCiudad).nombre.trim()) : undefined;
    idBarrio = idBarrio == undefined || idBarrio == -2 ? undefined : idBarrio;
    let barrio = idBarrio ? StringUtils.toTitleCase(_.find(this.state.barrios, item => item.value == idBarrio).label.trim()) : undefined;

    this.setState({ cargando: true }, () => {
      Rules_Usuario.actualizarDatosDomicilio({
        token: this.state.token,
        direccion: direccion,
        altura: altura,
        depto: depto,
        torre: torre,
        piso: piso,
        codigoPostal: 0,
        idProvincia: idProvincia,
        provincia: provincia,
        idCiudad: idCiudad,
        ciudad: ciudad,
        idBarrio: idBarrio,
        barrio: barrio
      })
        .then(() => {
          this.props.mostrarAlertaVerde({ texto: "Datos de domicilio modificados correctamente" });
          this.validarToken();
          this.onDatosCambiados();
        })
        .catch(error => {
          this.mostrarDialogoError(error);
        })
        .finally(() => {
          this.setState({ cargando: false });
        });
    });
  };

  onProvinciaChange = item => {
    let id = undefined;
    if (item && item.value > 0) {
      id = item.value;
    }

    let ciudades = _.filter(Ciudades, ciudad => {
      return ciudad.id_provincia == item.value;
    }).map(ciudad => {
      return {
        value: ciudad.id,
        label: StringUtils.toTitleCase(ciudad.nombre)
      };
    });

    this.setState({
      ciudades: ciudades,
      datosDeDomicilio: {
        ...this.state.datosDeDomicilio,
        idProvincia: item.value,
        idCiudad: undefined,
        idBarrio: undefined,
        esCordoba: false
      },
      errores: {
        ...this.state.errores,
        domicilio: {
          ...this.state.errores.domicilio,
          provincia: undefined,
          ciudad: undefined,
          barrio: undefined
        }
      }
    });
  };

  onCiudadChange = item => {
    let id = undefined;
    if (item && item.value > 0) {
      id = item.value;
    }

    this.setState({
      datosDeDomicilio: {
        ...this.state.datosDeDomicilio,
        idCiudad: id,
        idBarrio: undefined,
        esCordoba: id == CIUDAD_CORDOBA
      },
      errores: {
        ...this.state.errores,
        domicilio: {
          ...this.state.errores.domicilio,
          ciudad: undefined,
          barrio: undefined
        }
      }
    });
  };

  onBarrioChange = barrio => {
    let idBarrio = undefined;
    if (barrio && barrio.value > 0) {
      idBarrio = barrio.value;
    }

    this.setState({
      datosDeDomicilio: {
        ...this.state.datosDeDomicilio,
        idBarrio: idBarrio
      },
      errores: {
        ...this.state.errores,
        domicilio: {
          ...this.state.errores.domicilio,
          barrio: undefined
        }
      }
    });
  };

  //Datos extra
  getOpcionesOcupaciones = memoizeOne(data => {
    if (data == undefined) return [];
    return data.map(item => {
      return { value: item.id, label: item.nombre };
    });
  });

  getOpcionesEstadoCivil = memoizeOne(data => {
    if (data == undefined) return [];
    return data.map(item => {
      return { value: item.id, label: item.nombre };
    });
  });

  getOpcionesEstudiosAlcanzados = memoizeOne(data => {
    if (data == undefined) return [];
    return data.map(item => {
      return { value: item.id, label: item.nombre };
    });
  });

  onEstadoCivilChange = estadoCivil => {
    this.setState({
      datosExtra: {
        ...this.state.datosExtra,
        idEstadoCivil: estadoCivil ? estadoCivil.value : undefined
      }
    });
  };

  onEstudioAlcanzadoChange = estudioAlcanzado => {
    this.setState({
      datosExtra: {
        ...this.state.datosExtra,
        idEstudioAlcanzado: estudioAlcanzado ? estudioAlcanzado.value : undefined
      }
    });
  };

  onOcupacionChange = ocupacion => {
    this.setState({
      datosExtra: {
        ...this.state.datosExtra,
        idOcupacion: ocupacion ? ocupacion.value : undefined
      }
    });
  };

  onDatosExtraInputChange = e => {
    this.setState({
      datosExtra: {
        ...this.state.datosExtra,
        [e.currentTarget.name]: e.currentTarget.value
      }
    });
  };

  onDatosExtraInputKeyPress = e => {
    if (e.key == "Enter") {
      this.onBotonGuardarCambiosDatosExtraClick();
    }
  };

  onBotonGuardarCambiosDatosExtraClick = () => {
    let cantidadHijos = this.state.datosExtra.cantidadHijos || "";
    if (cantidadHijos != "") {
      cantidadHijos = parseInt(cantidadHijos);
      if (cantidadHijos < 0) {
        this.props.mostrarAlertaRoja({ texto: "La cantidad de hijos no puede ser menor a 0" });
        return;
      }
    } else {
      cantidadHijos = null;
    }

    this.setState({ cargando: true }, async () => {
      try {
        await Rules_Usuario.actualizarDatosExtra({
          token: this.state.token,
          idEstadoCivil: this.state.datosExtra.idEstadoCivil || null,
          idOcupacion: this.state.datosExtra.idOcupacion || null,
          idEstudioAlcanzado: this.state.datosExtra.idEstudioAlcanzado || null,
          cantidadHijos: cantidadHijos
        });
        this.props.mostrarAlertaVerde({ texto: "Datos adicionales modificados correctamente" });
        this.validarToken();
        this.onDatosCambiados();
      } catch (ex) {
        this.setState({ cargando: false });
        let error = typeof ex === "object" ? ex.message : ex;
        this.mostrarDialogoError(error);
      }
    });
  };

  onBotonValidarNumeroTramite = () => {
    let numeroTramite = this.state.numeroTramite;
    if (numeroTramite.trim() == "") {
      this.props.mostrarAlertaRoja({ texto: "Ingrese el numero de trámite" });
      return;
    }

    this.setState({ cargando: true }, async () => {
      try {
        let resultado = await Rules_Usuario.actualizarNumeroTramite({ token: this.state.token, numeroTramite: numeroTramite });
        if (!resultado) {
          this.props.mostrarAlertaRoja({ texto: "Error procesando la solicitud" });
          this.setState({ cargando: false });
          return;
        }

        this.props.mostrarAlertaVerde({ texto: "Número de trámite validado correctamente" });
        this.onDatosCambiados();
        this.validarToken();
      } catch (ex) {
        let mensaje = typeof ex == "object" ? ex.message : ex;
        this.props.mostrarAlertaRoja({ texto: mensaje });
        this.setState({ cargando: false });
      }
    });
  };

  onFileFotoDNIFrente = e => {
    var files = e.target.files; // FileList object
    if (files.length != 1) return;
    var file = files[0];

    this.setState({ cargando: true }, () => {
      loadImage(
        file,
        async canvas => {
          this.filePickerFotoDNIFrente.value = "";
          let foto = canvas.toDataURL("image/png", 0.7);

          try {
            await Rules_Usuario.cambiarFotoDNIFrente({
              token: this.state.token,
              content: foto
            });

            this.setState({ cargando: false });
            this.props.mostrarAlertaVerde({ texto: "Foto de frente de DNI modificada correctamente" });
            this.onDatosCambiados();
            this.validarToken();
          } catch (ex) {
            let mensaje = typeof ex === "object" ? ex.message : ex;
            this.mostrarDialogoError(mensaje);
            this.setState({ cargando: false });
          }
        },
        { maxWidth: FOTO_DNI_MAX, orientation: true, canvas: true }
      );
    });
  };

  onFileFotoDNIReverso = e => {
    var files = e.target.files; // FileList object
    if (files.length != 1) return;
    var file = files[0];

    this.setState({ cargando: true }, () => {
      loadImage(
        file,
        async canvas => {
          this.filePickerFotoDNIFrente.value = "";
          let foto = canvas.toDataURL("image/png", 0.7);

          try {
            await Rules_Usuario.cambiarFotoDNIReverso({
              token: this.state.token,
              content: foto
            });

            this.setState({ cargando: false });
            this.props.mostrarAlertaVerde({ texto: "Foto de reverso de DNI modificada correctamente" });
            this.onDatosCambiados();
            this.validarToken();
          } catch (ex) {
            let mensaje = typeof ex === "object" ? ex.message : ex;
            this.mostrarDialogoError(mensaje);
            this.setState({ cargando: false });
          }
        },
        { maxWidth: FOTO_DNI_MAX, orientation: true, canvas: true }
      );
    });
  };

  onBotonFotoDNIFrenteClick = () => {
    if (this.filePickerFotoDNIFrente) {
      this.filePickerFotoDNIFrente.value = "";
      this.filePickerFotoDNIFrente.click();
    }
  };

  onBotonFotoDNIReversoClick = () => {
    if (this.filePickerFotoDNIReverso) {
      this.filePickerFotoDNIReverso.value = "";
      this.filePickerFotoDNIReverso.click();
    }
  };

  render() {
    const { classes } = this.props;
    const { visible, cargando } = this.state;

    return (
      <React.Fragment>
        <div className={classNames(classes.root, classes.opacityView, visible && "visible")} id="containerId">
          <div className={classes.panelVerde}>
            <div className={classNames(classes.contenedorLogos, classes.opacityView, visible && "visible")}>
              <div className="muniCordoba" />
              <div className="muniOnline" />
            </div>
          </div>

          <div className={classNames(classes.panelContenido, visible == true && "visible")}>
            {/* Datos personales */}
            <Element name="datosPersonales" className="element">
              {this.renderDatosPersonales()}
            </Element>

            <Element name="datosValidacion" className="element">
              {this.renderDatosValidacion()}
            </Element>

            {/* Datos de acceso */}
            <Element name="datosAcceso" className="element">
              {this.renderDatosDeAcceso()}
            </Element>

            {/* Datos de contacto  */}
            <Element name="datosContacto" className="element">
              {this.renderDatosDeContacto()}
            </Element>

            {/* Datos domicilio */}
            <Element name="datosDomicilio" className="element">
              {this.renderDatosDomicilio()}
            </Element>

            {/* Datos extra */}
            <Element name="datosExtra" className="element">
              {this.renderDatosExtra()}
            </Element>
          </div>
        </div>

        {this.renderError()}

        <div className={classNames(classes.contenedorCargando, cargando == true && "visible")}>
          <LinearProgress />
        </div>

        {/* Dialogo username */}
        <MiDialogoInput
          titulo="Cambiar nombre de usuario"
          label="Nombre de usuario nuevo"
          placeholder={this.props.usuario ? this.props.usuario.username : ""}
          visible={this.state.dialogoUsernameVisible}
          autoCerrarBotonSi={false}
          onClose={this.onDialogoUsernameClose}
          onBotonSiClick={this.cambiarUsername}
          mostrarBaner={this.state.dialogoUsernameMostrarBaner}
          textoBaner={this.state.dialogoUsernameBanerTexto}
          mostrarBotonBaner={true}
          onBotonBanerClick={this.onDialogoUsernameBotonBanerClick}
          cargando={this.state.dialogoUsernameCargando}
          textoSi="Cambiar"
          textoNo="Cancelar"
        />

        {/* Dialogo password */}
        <MiDialogoInput
          titulo="Cambiar contraseña"
          label={"Contraseña actual"}
          visible={this.state.dialogoPasswordVisible}
          autoCerrarBotonSi={false}
          onClose={this.onDialogoPasswordClose}
          onBotonSiClick={this.cambiarPassword}
          mostrarBaner={this.state.dialogoPasswordMostrarBaner}
          textoBaner={this.state.dialogoPasswordBanerTexto}
          mostrarBotonBaner={true}
          onBotonBanerClick={this.onDialogoPasswordBotonBanerClick}
          cargando={this.state.dialogoPasswordCargando}
          inputAutoComplete="current-password"
          inputType="password"
          textoSi="Cambiar"
          textoNo="Cancelar"
        >
          <React.Fragment>
            <div style={{ height: 16 }} />

            <Grid container spacing={16}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Contraseña nueva"
                  autoComplete="new-password"
                  type="password"
                  multiline={false}
                  id="inputPasswordNueva"
                  name="dialogoPasswordPasswordNueva"
                  value={this.state.dialogoPasswordPasswordNueva}
                  onKeyPress={this.onDialogoPasswordInputKeyPress}
                  onChange={this.onDialogoPasswordInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="inputPasswordNuevaRepeat"
                  fullWidth
                  variant="outlined"
                  value={this.state.dialogoPasswordPasswordNuevaRepeat}
                  name="dialogoPasswordPasswordNuevaRepeat"
                  multiline={false}
                  autoComplete="new-password"
                  type="password"
                  onChange={this.onDialogoPasswordInputChange}
                  label={"Repita su nueva contraseña"}
                  onKeyPress={this.onDialogoPasswordInputKeyPress}
                />
              </Grid>
            </Grid>
          </React.Fragment>
        </MiDialogoInput>

        <MiDialogoMensaje
          textoSi="Aceptar"
          botonNoVisible={false}
          mensaje={this.state.errorDialogo}
          visible={this.state.dialogoErrorVisible}
          onClose={this.onDialogoErrorClose}
        />
      </React.Fragment>
    );
  }

  renderError() {
    if (this.state.errorVisible != true) return null;
    return (
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "white" }}>
        <MiPanelMensaje error mensaje={this.state.errorMensaje} boton="Reintentar" onBotonClick={this.validarToken} />
      </div>
    );
  }

  renderFoto() {
    const { classes, usuario } = this.props;

    let urlFotoPerfilMiniatura;
    let nombre;
    if (usuario) {
      urlFotoPerfilMiniatura = CordobaFilesUtils.getUrlFotoMediana(this.state.identificadorFotoPersonal, usuario.sexoMasculino);
      nombre = `${usuario.nombre} ${usuario.apellido}`;
    }

    return (
      <div className={classes.contenedorFoto}>
        <input onChange={this.onFile} style={{ display: "none" }} ref={this.onFilePickerRef} type="file" id="pickerFile" accept="image/*" />
        <ButtonBase className={"foto"} onClick={this.onBotonSeleccionarFotoClick}>
          <div style={{ backgroundImage: `url(${urlFotoPerfilMiniatura})` }} />
          <Typography className="texto" variant="body2">
            Cambiar foto
          </Typography>
        </ButtonBase>
        <Typography variant="headline" className={"nombre"}>
          {nombre}
        </Typography>
      </div>
    );
  }

  renderDatosPersonales() {
    const { classes, usuario } = this.props;
    let nombre;
    let dni;
    let cuil;
    let fechaNacimiento;
    let sexo;
    let domicilioLegal;
    if (usuario) {
      nombre = StringUtils.toTitleCase(`${usuario.nombre} ${usuario.apellido}`);
      dni = usuario.dni;
      cuil = usuario.cuil;
      fechaNacimiento = this.convertirFechaNacimientoString(this.convertirFechaStringToDate(usuario.fechaNacimiento));
      sexo = usuario.sexoMasculino ? "Masculino" : "Femenino";
      domicilioLegal = usuario.domicilioLegal;
    }

    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosPersonales,
          classes.translateView,
          this.state.cardDatosPersonalesVisible == true && "visible"
        )}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={this.onBotonBackClick}>
            <IconArrowBackOutlined />
          </IconButton>
          <div style={{ flex: 1 }} />
          <div>
            <MenuApps color="rgba(0,0,0,0.7)" token={usuario && usuario.token} />
          </div>
        </div>

        <div style={{ height: 72 }} />

        {/* Foto */}
        {this.renderFoto()}

        <Typography variant="title">Datos personales</Typography>

        <div style={{ height: "16px" }} />
        <MiBaner
          className={classes.contenedorError}
          visible={true}
          mensaje={"Como sus datos se encuentran validados por el Registro Nacional de Personas, estos no se pueden editar"}
          modo="info"
        />

        <div style={{ height: "16px" }} />

        <div className={classes.contenedorTextos}>
          <MiItemDetalle titulo="Nombre" contenido={nombre} />
          <MiItemDetalle titulo="N° de Documento" contenido={dni} />
          <MiItemDetalle titulo="CUIL" contenido={cuil} />
          <MiItemDetalle titulo="Fecha de nacimiento" contenido={fechaNacimiento} />
          <MiItemDetalle titulo="Sexo" contenido={sexo} />
          <MiItemDetalle titulo="Domicilio legal" contenido={domicilioLegal} />
        </div>
      </div>
    );
  }

  renderDatosValidacion() {
    const { classes, usuario } = this.props;
    const fotoDNIFrente = this.state.fotoDNIFrente;
    const fotoDNIReverso = this.state.fotoDNIReverso;

    let urlFotoDNIFrente = "";
    if (fotoDNIFrente) {
      urlFotoDNIFrente = window.Config.URL_CORDOBA_FILES + "/Archivo/" + fotoDNIFrente + "/2";
    }

    let urlFotoDNIReverso = "";
    if (fotoDNIReverso) {
      urlFotoDNIReverso = window.Config.URL_CORDOBA_FILES + "/Archivo/" + fotoDNIReverso + "/2";
    }

    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosValidacion,
          classes.translateView,
          this.state.cardDatosValidacionVisible == true && "visible"
        )}
      >
        <Typography variant="title">Validación de documentación</Typography>
        <div style={{ height: "16px" }} />

        {/* Seccion mensaje */}
        {this.state.seccion && this.state.seccion == "datosValidacion" && (
          <React.Fragment>
            <MiBaner className={classes.contenedorError} visible={true} mensaje={this.state.seccionMensaje} modo="info" />
            <div style={{ height: "32px" }} />
          </React.Fragment>
        )}

        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            {usuario && usuario.validacionNumeroTramite == true && (
              <React.Fragment>
                <Grid item xs={12}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Icon style={{ marginRight: 8, color: "green" }}>check_outline</Icon>
                    <Typography>Número de trámite validado correctamente</Typography>
                  </div>
                </Grid>
              </React.Fragment>
            )}
            {usuario && usuario.validacionNumeroTramite != true && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body2">Validación de numero de tramite de DNI</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>El numero de trámite es un dato opcional pero algunas gestiones pueden requerirlo</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1, marginRight: 8 }}> */}
                  <TextField
                    fullWidth
                    name="numeroTramite"
                    label="Número de trámite"
                    variant="outlined"
                    placeholder=""
                    value={this.state.numeroTramite}
                    onChange={e => {
                      this.setState({ numeroTramite: e.currentTarget.value });
                    }}
                    onKeyPress={e => {
                      if (e.Key == "Enter") {
                        this.onBotonValidarNumeroTramite();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Ayuda"
                            onClick={() => {
                              this.setState({ dialogoNumeroTramiteAyudaVisible: true });
                            }}
                          >
                            <IconHelpOutlined />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" color="primary" onClick={this.onBotonValidarNumeroTramite}>
                    Validar
                  </Button>
                </Grid>
              </React.Fragment>
            )}

            <div style={{ height: 1, backgroundColor: "rgba(0,0,0,0.1)", width: "100%", marginTop: 16, marginBottom: 16 }} />

            {fotoDNIFrente && fotoDNIReverso && (
              <Grid item xs={12}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Icon style={{ marginRight: 8, color: "green" }}>check_outline</Icon>
                  <Typography>Imagenes de frente y reverso de DNI subidas correctamente</Typography>
                </div>
              </Grid>
            )}

            {(fotoDNIFrente == undefined || fotoDNIReverso == undefined) && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body2">Validación de imagenes del DNI</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography>Suba una imagen del frente y otra del reverso de su DNI</Typography>
                </Grid>
              </React.Fragment>
            )}

            <Grid item xs={12}>
              <input
                onChange={this.onFileFotoDNIFrente}
                style={{ display: "none" }}
                ref={this.onFilePickerFotoDNIFrenteRef}
                type="file"
                accept="image/*"
              />
              <input
                onChange={this.onFileFotoDNIReverso}
                style={{ display: "none" }}
                ref={this.onFilePickerFotoDNIReversoRef}
                type="file"
                accept="image/*"
              />

              <div style={{ display: "flex" }}>
                {fotoDNIFrente == undefined && (
                  <ButtonBase className={classes.fotoDni} onClick={this.onBotonFotoDNIFrenteClick}>
                    <Icon>add</Icon>
                  </ButtonBase>
                )}
                {fotoDNIFrente != undefined && (
                  <ButtonBase
                    className={classes.fotoDni}
                    style={{ backgroundImage: `url(${urlFotoDNIFrente})` }}
                    onClick={this.onBotonFotoDNIFrenteClick}
                  />
                )}
                {fotoDNIReverso == undefined && (
                  <ButtonBase className={classes.fotoDni} onClick={this.onBotonFotoDNIReversoClick}>
                    <Icon>add</Icon>
                  </ButtonBase>
                )}
                {fotoDNIReverso != undefined && (
                  <ButtonBase
                    className={classes.fotoDni}
                    style={{ backgroundImage: `url(${urlFotoDNIReverso})` }}
                    onClick={this.onBotonFotoDNIReversoClick}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        </div>

        <DialogoNumeroTramiteAyuda
          visible={this.state.dialogoNumeroTramiteAyudaVisible || false}
          onClose={() => {
            this.setState({ dialogoNumeroTramiteAyudaVisible: false });
          }}
        />
      </div>
    );
  }

  renderDatosDeAcceso() {
    const { classes, usuario } = this.props;
    let username;
    if (usuario) {
      username = usuario.username;
    }
    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosAcceso,
          classes.translateView,
          this.state.cardDatosDeAccesoVisible == true && "visible"
        )}
      >
        <Typography variant="title" style={{ marginBottom: "16px" }}>
          Datos de acceso
        </Typography>

        {/* Seccion mensaje */}
        {this.state.seccion && this.state.seccion == "datosAcceso" && (
          <React.Fragment>
            <MiBaner className={classes.contenedorError} visible={true} mensaje={this.state.seccionMensaje} modo="info" />
            <div style={{ height: "32px" }} />
          </React.Fragment>
        )}

        <div className={classes.contenedorTextos}>
          <MiItemDetalle
            titulo="Nombre de usuario"
            contenido={username}
            mostrarBoton={true}
            onBotonClick={this.mostrarDialogoUsername}
            botonIcono={<IconEditOutlined color="primary" />}
          />
          <MiItemDetalle
            titulo="Contraseña"
            contenido="********"
            mostrarBoton={true}
            onBotonClick={this.mostrarDialogoPassword}
            botonIcono={<IconEditOutlined color="primary" />}
          />
        </div>
      </div>
    );
  }

  renderDatosDeContacto() {
    const { classes, usuario } = this.props;
    let { errores, datosDeContacto } = this.state;
    datosDeContacto = datosDeContacto || {};

    let email;
    let telefonoCelularCaracteristica;
    let telefonoCelularNumero;
    let telefonoFijoNumero;
    let telefonoFijoCaracteristica;
    let facebook;
    let instagram;
    let linkedIn;
    let twitter;
    if (usuario && datosDeContacto) {
      email = datosDeContacto.email;
      telefonoCelularCaracteristica = datosDeContacto.telefonoCelularCaracteristica;
      telefonoCelularNumero = datosDeContacto.telefonoCelularNumero;
      telefonoFijoNumero = datosDeContacto.telefonoFijoNumero;
      telefonoFijoCaracteristica = datosDeContacto.telefonoFijoCaracteristica;
      facebook = datosDeContacto.facebook;
      instagram = datosDeContacto.instagram;
      linkedIn = datosDeContacto.linkedIn;
      twitter = datosDeContacto.twitter;
    }

    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosDeContacto,
          classes.translateView,
          this.state.cardDatosDeContactoVisible == true && "visible"
        )}
      >
        <Typography variant="title">Datos de contacto</Typography>
        <div style={{ height: "16px" }} />

        {/* Seccion mensaje */}
        {this.state.seccion && this.state.seccion == "datosContacto" && (
          <React.Fragment>
            <MiBaner className={classes.contenedorError} visible={true} mensaje={this.state.seccionMensaje} modo="info" />
            <div style={{ height: "32px" }} />
          </React.Fragment>
        )}

        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                error={errores.contacto["email"] !== undefined}
                helperText={errores.contacto["email"]}
                name="email"
                label="E-Mail"
                variant="outlined"
                placeholder=""
                margin="dense"
                value={email || ""}
                onChange={this.onDatosDeContactoInputChange}
                onKeyPress={this.onDatosDeContactoInputKeyPress}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" style={{ marginTop: "8px" }}>
                Telefono celular
              </Typography>
            </Grid>
            {/* Celular caracteristica */}
            <Grid item xs={3} sm={2}>
              <TextField
                fullWidth
                variant="outlined"
                margin="dense"
                label="Área"
                error={errores.contacto["telefonoCelularCaracteristica"] !== undefined}
                helperText={errores.contacto["telefonoCelularCaracteristica"]}
                name="telefonoCelularCaracteristica"
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                value={telefonoCelularCaracteristica || ""}
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">0</InputAdornment>
                }}
              />
            </Grid>
            {/* Celular numero */}
            <Grid item xs={9} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Número"
                error={errores.contacto["telefonoCelularNumero"] !== undefined}
                helperText={errores.contacto["telefonoCelularNumero"]}
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                name="telefonoCelularNumero"
                margin="dense"
                value={telefonoCelularNumero || ""}
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">15</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" style={{ marginTop: "8px" }}>
                Telefono fijo
              </Typography>
            </Grid>
            {/* Fijo caracteristica */}
            <Grid item xs={3} sm={2}>
              <TextField
                fullWidth
                variant="outlined"
                error={errores.contacto["telefonoFijoCaracteristica"] !== undefined}
                helperText={errores.contacto["telefonoFijoCaracteristica"]}
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                name="telefonoFijoCaracteristica"
                label="Área"
                placeholder=""
                margin="dense"
                value={telefonoFijoCaracteristica || ""}
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">0</InputAdornment>
                }}
              />
            </Grid>

            {/* Fijo numero */}
            <Grid item xs={9} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Número"
                placeholder=""
                error={errores.contacto["telefonoFijoNumero"] !== undefined}
                helperText={errores.contacto["telefonoFijoNumero"]}
                name="telefonoFijoNumero"
                margin="dense"
                value={telefonoFijoNumero || ""}
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                onChange={this.onDatosDeContactoInputChange}
              />
            </Grid>

            {/* Redes */}
            <Grid item xs={12}>
              <Typography variant="body2" style={{ marginTop: "8px" }}>
                Redes sociales
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                error={errores.contacto["facebook"] !== undefined}
                helperText={errores.contacto["facebook"]}
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                name="facebook"
                value={facebook || ""}
                label="Facebook"
                margin="dense"
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <Icon className="mdi mdi-facebook-box" />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                helperText={errores.contacto["twitter"]}
                error={errores.contacto["twitter"] !== undefined}
                id="twitter"
                name="twitter"
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                value={twitter || ""}
                label="Twitter"
                margin="dense"
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <Icon className="mdi mdi-twitter-box" />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                error={errores.contacto["instagram"] !== undefined}
                helperText={errores.contacto["instagram"]}
                name="instagram"
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                value={instagram || ""}
                label="Instagram"
                margin="dense"
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <Icon className="mdi mdi-instagram" />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                error={errores.contacto["linkedIn"] !== undefined}
                helperText={errores.contacto["linkedIn"]}
                name="linkedIn"
                margin="dense"
                onKeyPress={this.onDatosDeContactoInputKeyPress}
                value={linkedIn || ""}
                label="LinkedIn"
                onChange={this.onDatosDeContactoInputChange}
                InputProps={{
                  startAdornment: <Icon className="mdi mdi-linkedin-box" />
                }}
              />
            </Grid>
          </Grid>
        </div>
        <div className={classes.contenedorBotones}>
          <Button variant="contained" color="primary" onClick={this.onBotonGuardarCambiosDatosDeContactoClick}>
            Guardar cambios
          </Button>
        </div>
      </div>
    );
  }

  renderDatosDomicilio() {
    let { classes, usuario } = this.props;
    let { errores, provincias, ciudades, datosDeDomicilio, barrios } = this.state;

    let urlMapa;
    if (
      usuario &&
      usuario.domicilioDireccion &&
      usuario.domicilioAltura &&
      usuario.domicilioCiudadNombre &&
      usuario.domicilioProvinciaNombre
    ) {
      let query = `${usuario.domicilioDireccion} ${usuario.domicilioAltura}, ${usuario.domicilioCiudadNombre}, ${
        usuario.domicilioProvinciaNombre
      }`;
      urlMapa = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        query
      )}&zoom=15&scale=1&size=300x300&maptype=roadmap&key=${
        window.Config.GOOGLE_STATIC_MAP_API_KEY
      }&format=png&visual_refresh=false&markers=size:mid%7Ccolor:0xff0000%7Clabel:%7C${encodeURIComponent(query)}`;
    }

    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosDomicilio,
          classes.translateView,
          this.state.cardDatosDomicilioVisible == true && "visible"
        )}
      >
        <Typography variant="title">Domicilio</Typography>
        <div style={{ height: "16px" }} />

        {/* Seccion mensaje */}
        {this.state.seccion && this.state.seccion == "datosDomicilio" && (
          <React.Fragment>
            <MiBaner className={classes.contenedorError} visible={true} mensaje={this.state.seccionMensaje} modo="info" />
            <div style={{ height: "32px" }} />
          </React.Fragment>
        )}

        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={urlMapa ? 9 : 12}>
              <Grid container spacing={16}>
                {/* Direccion */}
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={errores.domicilio["direccion"] !== undefined}
                    helperText={errores.domicilio["direccion"]}
                    name="direccion"
                    value={datosDeDomicilio.direccion || ""}
                    label="Calle"
                    margin="dense"
                    placeholder=""
                    onChange={this.onDatosDeDomicilioInputChange}
                    onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                  />
                </Grid>

                {/* Altura */}
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={errores.domicilio["altura"] !== undefined}
                    helperText={errores.domicilio["altura"]}
                    name="altura"
                    value={datosDeDomicilio.altura || ""}
                    label="Altura"
                    margin="dense"
                    placeholder=""
                    onChange={this.onDatosDeDomicilioInputChange}
                    onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                  />
                </Grid>

                {/* Torre */}
                <Grid item xs={4} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={errores.domicilio["torre"] !== undefined}
                    helperText={errores.domicilio["torre"]}
                    name="torre"
                    margin="dense"
                    value={datosDeDomicilio.torre || ""}
                    label="Torre"
                    placeholder=""
                    onChange={this.onDatosDeDomicilioInputChange}
                    onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                  />
                </Grid>
                {/* Piso */}
                <Grid item xs={4} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={errores.domicilio["piso"] !== undefined}
                    helperText={errores.domicilio["piso"]}
                    name="piso"
                    margin="dense"
                    value={datosDeDomicilio.piso || ""}
                    label="Piso"
                    placeholder=""
                    onChange={this.onDatosDeDomicilioInputChange}
                    onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                  />
                </Grid>

                {/* Depto */}
                <Grid item xs={4} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={errores.domicilio["depto"] !== undefined}
                    helperText={errores.domicilio["depto"]}
                    name="depto"
                    value={datosDeDomicilio.depto || ""}
                    label="Depto"
                    margin="dense"
                    placeholder=""
                    onChange={this.onDatosDeDomicilioInputChange}
                    onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                  />
                </Grid>

                {/* Provincias */}
                <Grid item xs={12} sm={4}>
                  <FormControl
                    className={classes.formControl}
                    fullWidth
                    margin="dense"
                    error={errores.domicilio["provincia"] !== undefined}
                    aria-describedby="provinciaError"
                  >
                    <MiSelect
                      variant="outlined"
                      value={datosDeDomicilio.idProvincia || -1}
                      label="Provincia"
                      margin="dense"
                      placeholder="Seleccione..."
                      onChange={this.onProvinciaChange}
                      options={provincias}
                    />
                    <FormHelperText id="provinciaError">{errores.domicilio["provincia"]}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Ciudades */}
                <Grid item xs={12} sm={4}>
                  <FormControl
                    className={classes.formControl}
                    fullWidth
                    margin="dense"
                    error={errores.domicilio["ciudad"] !== undefined}
                    aria-describedby="ciudadError"
                  >
                    <MiSelect
                      variant="outlined"
                      margin="dense"
                      disabled={datosDeDomicilio.idProvincia == undefined || datosDeDomicilio.idProvincia == -1}
                      value={datosDeDomicilio.idCiudad || -1}
                      label="Ciudad"
                      placeholder="Seleccione..."
                      onChange={this.onCiudadChange}
                      options={ciudades}
                    />
                    <FormHelperText id="ciudadError">{this.state.errores.domicilio["ciudad"]}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Barrio */}
                {datosDeDomicilio.esCordoba === true && (
                  <Grid item xs={12} sm={4}>
                    <FormControl
                      className={classes.formControl}
                      fullWidth
                      margin="dense"
                      error={errores.domicilio["barrio"] !== undefined}
                      aria-describedby="barrioError"
                    >
                      <MiSelect
                        variant="outlined"
                        margin="dense"
                        value={datosDeDomicilio.idBarrio || -1}
                        label="Barrio"
                        placeholder="Seleccione..."
                        onChange={this.onBarrioChange}
                        options={barrios}
                      />
                      <FormHelperText id="barrioError">{errores.domicilio["barrio"]}</FormHelperText>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {urlMapa && (
              <Grid item xs={12} md={3}>
                <div
                  style={{
                    borderRadius: "8px",
                    width: "100%",
                    height: 300,
                    backgroundImage: "url(" + urlMapa + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              </Grid>
            )}
          </Grid>
        </div>
        <div className={classes.contenedorBotones}>
          <Button variant="contained" color="primary" onClick={this.onBotonGuardarCambiosDatosDomicilioClick}>
            Guardar cambios
          </Button>
        </div>
      </div>
    );
  }

  renderDatosExtra() {
    const { classes } = this.props;
    let { errores, datosExtra, estadosCiviles, estudiosAlcanzados, ocupaciones } = this.state;
    errores = errores || {};
    datosExtra = datosExtra || {};

    let opcionesEstadoCivil = this.getOpcionesEstadoCivil(estadosCiviles);
    let opcionesEstudiosAlcanzados = this.getOpcionesEstudiosAlcanzados(estudiosAlcanzados);
    let opcionesOcupaciones = this.getOpcionesOcupaciones(ocupaciones);

    return (
      <div
        className={classNames(
          classes.card,
          classes.cardDatosExtra,
          classes.translateView,
          this.state.cardDatosExtraVisible == true && "visible"
        )}
      >
        <Typography variant="title">Datos adicionales</Typography>

        <div style={{ height: "16px" }} />

        {/* Seccion mensaje */}
        {this.state.seccion && this.state.seccion == "datosExtra" && (
          <React.Fragment>
            <MiBaner className={classes.contenedorError} visible={true} mensaje={this.state.seccionMensaje} modo="info" />
            <div style={{ height: "32px" }} />
          </React.Fragment>
        )}

        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            {/* Email */}
            <Grid item xs={12} sm={6}>
              <MiSelect
                variant="outlined"
                fullWidth
                margin="dense"
                label="Estado civil"
                placeholder="Seleccione..."
                onChange={this.onEstadoCivilChange}
                value={datosExtra.idEstadoCivil}
                options={opcionesEstadoCivil}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MiSelect
                variant="outlined"
                fullWidth
                margin="dense"
                label="Estudios alcanzados"
                placeholder="Seleccione..."
                options={opcionesEstudiosAlcanzados}
                value={datosExtra.idEstudioAlcanzado}
                onChange={this.onEstudioAlcanzadoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MiSelect
                variant="outlined"
                fullWidth
                margin="dense"
                label="Profesión / Oficio"
                placeholder="Seleccione..."
                onChange={this.onOcupacionChange}
                value={datosExtra.idOcupacion}
                options={opcionesOcupaciones}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                name="cantidadHijos"
                margin="dense"
                type="number"
                value={datosExtra.cantidadHijos != undefined ? datosExtra.cantidadHijos : ""}
                label="Cantidad de hijos"
                placeholder=""
                onChange={this.onDatosExtraInputChange}
                onKeyPress={this.onDatosExtraInputKeyPress}
              />
            </Grid>
          </Grid>
        </div>
        <div className={classes.contenedorBotones}>
          <Button variant="contained" color="primary" onClick={this.onBotonGuardarCambiosDatosExtraClick}>
            Guardar cambios
          </Button>
        </div>
      </div>
    );
  }
}

let componente = Perfil;
componente = withStyles(styles)(componente);
componente = withWidth()(componente);
componente = withRouter(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);

export default componente;
