import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import "@UI/transitions.css";
import "./styleFoto.css";

import styles from "./styles";

//Router
import { withRouter } from "react-router-dom";

//REDUX
import { connect } from "react-redux";
import { push, goBack } from "connected-react-router";
import { login } from "@Redux/Actions/usuario";
import { mostrarAlertaVerde, mostrarAlertaNaranja, mostrarAlertaRoja, mostrarAlerta } from "@Redux/Actions/alerta";

//Componentes
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";

// import { CSSTransition } from "react-transition-group";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import _ from "lodash";

import IconEditOutlined from "@material-ui/icons/EditOutlined";

//Mis componentes
import MiPagina from "@Componentes/MiPagina";
import Validador from "@Componentes/Utils/Validador";
import MiPanelMensaje from "@Componentes/MiPanelMensaje";
import MiBaner from "@Componentes/MiBaner";
import MiCard from "@Componentes/MiCard";
import MiItemDetalle from "@Componentes/MiItemDetalle";
import MiContent from "@Componentes/MiContent";
import MiSelect from "@Componentes/MiSelect";
import MiDialogoInput from "@Componentes/MiDialogoInput";
import MiDialogoMensaje from "@Componentes/MiDialogoMensaje";
import CordobaFilesUtils from "@Componentes/Utils/CordobaFiles";
import StringUtils from "@Componentes/Utils/String";
import FotoUtils from "@Componentes/Utils/Foto";

//Mis Rules
import Rules_Usuario from "@Rules/Rules_Usuario";
import Rules_Barrios from "@Rules/Rules_Barrios";

//Recursos
import ToolbarLogo from "@Resources/imagenes/escudo_muni_texto_verde.png";
import ToolbarLogo_Chico from "@Resources/imagenes/escudo_muni_verde.png";

import Provincias from "./_provincias";
import Ciudades from "./_ciudades";

const CIUDAD_CORDOBA = 543;

const mapDispatchToProps = dispatch => ({
  mostrarAlertaVerde: comando => {
    dispatch(mostrarAlertaVerde(comando));
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
  return { usuario: state.Usuario.usuario };
};

class Perfil extends React.Component {
  constructor(props) {
    super(props);

    const urlParams = new URLSearchParams(props.location.search);

    let provincias = _.orderBy(Provincias, "nombre").map(item => {
      return { value: item.id, label: StringUtils.toTitleCase(item.nombre) };
    });

    this.state = {
      token: urlParams.get("token"),
      url: urlParams.get("url"),
      validandoToken: true,
      errorValidandoToken: undefined,
      mostrarBaner: true,

      provincias: provincias,
      ciudades: [],
      barrios: [],
      idProvincia: -1,
      idCiudad: -1,
      idBarrio: -2,
      //Form
      identificadorFotoPersonal: undefined,
      datosDeContacto: {},
      datosDeDomicilio: {},
      errores: {
        contacto: {},
        domicilio: {}
      },
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
    this.validarToken();
  }

  validarToken = () => {
    this.setState(
      {
        validandoToken: true,
        paginaActual: undefined
      },
      () => {
        Rules_Usuario.getDatos(this.state.token)
          .then(data => {
            if (data.validacionDNI === false) {
              this.setState({ errorValidandoToken: "Su usuario no se encuentra validado por el Registro Nacional de las Personas" });
              return;
            }

            Rules_Barrios.get()
              .then(barrios => {
                barrios = _.orderBy(barrios, "nombre").map(item => {
                  return { value: item.id, label: StringUtils.toTitleCase(item.nombre) };
                });

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

                this.props.login(data);

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
                this.setState({
                  identificadorFotoPersonal: data.identificadorFotoPersonal,
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
                  ciudades: ciudades,
                  barrios: barrios,
                  contenedorFotoVisible: true
                });

                setTimeout(() => {
                  this.setState({ cardDatosPersonalesVisible: true });
                }, 300);
                setTimeout(() => {
                  this.setState({ cardDatosDeAccesoVisible: true });
                }, 500);
                setTimeout(() => {
                  this.setState({ cardDatosDeContactoVisible: true });
                }, 700);
                setTimeout(() => {
                  this.setState({ cardDatosDomicilioVisible: true });
                }, 900);
              })
              .catch(error => {
                this.setState({ errorValidandoToken: error });
              });
          })
          .catch(error => {
            this.setState({
              errorValidandoToken: error
            });
          })
          .finally(() => {
            this.setState({ validandoToken: false });
          });
      }
    );
  };

  onFilePickerRef = ref => {
    this.filePicker = ref;
  };

  onFile = evt => {
    var files = evt.target.files; // FileList object
    if (files.length != 1) return;

    console.log(files);

    var file = files[0];
    var fr = new FileReader();

    if (file.size > 10 * 1024 * 1024) {
      this.setState({
        mostrarError: true,
        error: "Tamaño de imagen demasiado grande"
      });
      return;
    }

    let extension = file.name.split(".").pop();
    if (!_.includes(["png", "jpg"], extension)) {
      this.setState({
        mostrarError: true,
        error: "Formato de imagen no soportado"
      });
      return;
    }

    this.setState({ cargando: true }, () => {
      fr.onload = e => {
        this.filePicker.value = "";
        FotoUtils.achicar(e.target.result, 500)
          .then(imagen => {
            Rules_Usuario.cambiarFotoPerfil({
              token: this.state.token,
              base64: imagen
            })
              .then(() => {
                this.props.mostrarAlertaVerde({ texto: "Foto de perfil modificada correctamente" });
                this.validarToken();
              })
              .catch(error => {
                this.mostrarDialogoError(error);
              })
              .finally(() => {
                this.setState({ cargando: false });
              });
          })
          .catch(error => {
            this.mostrarDialogoError(error);
            this.setState({ cargando: false });
          });
      };
      fr.readAsDataURL(file);
    });
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

  onBotonRedirigirClick = () => {
    let { url } = this.state;
    if (url) {
      if (url.indexOf("?") != -1) {
        url += "&token=" + this.state.token;
      } else {
        url += "?token=" + this.state.token;
      }
    }
    window.location.href = url;
  };

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
        })
        .catch(error => {
          this.mostrarDialogoError(error);
        })
        .finally(() => {
          this.setState({ cargando: false });
        });
    });
  };

  onProvinciaChange = provincia => {
    let ciudades = _.filter(Ciudades, ciudad => {
      return ciudad.id_provincia == provincia.value;
    }).map(ciudad => {
      return {
        value: ciudad.id,
        label: StringUtils.toTitleCase(ciudad.nombre)
      };
    });

    let { datosDeDomicilio } = this.state;
    datosDeDomicilio.idProvincia = provincia.value;
    datosDeDomicilio.idCiudad = -1;
    datosDeDomicilio.idBarrio = -2;
    datosDeDomicilio.esCordoba = false;

    let erroresDomicilio = this.state.errores.domicilio;
    erroresDomicilio["provincia"] = undefined;

    this.setState({
      datosDeDomicilio: datosDeDomicilio,
      ciudades: ciudades,
      errores: { ...this.state.errores, domicilio: erroresDomicilio }
    });
  };

  onCiudadChange = ciudad => {
    let { datosDeDomicilio } = this.state;
    datosDeDomicilio.idCiudad = ciudad.value;
    datosDeDomicilio.idBarrio = -2;
    datosDeDomicilio.esCordoba = ciudad.value == CIUDAD_CORDOBA;

    let erroresDomicilio = this.state.errores.domicilio;
    erroresDomicilio["ciudad"] = undefined;

    this.setState({ datosDeDomicilio: datosDeDomicilio, errores: { ...this.state.errores, domicilio: erroresDomicilio } });
  };

  onBarrioChange = barrio => {
    let { datosDeDomicilio } = this.state;
    datosDeDomicilio.idBarrio = barrio.value;

    let erroresDomicilio = this.state.errores.domicilio;
    erroresDomicilio["barrio"] = undefined;

    this.setState({ datosDeDomicilio, errores: { ...this.state.errores, domicilio: erroresDomicilio } });
  };

  render() {
    const { classes } = this.props;

    const cargando = this.state.cargando || this.state.validandoToken;

    return (
      <MiPagina
        toolbarTitulo={"Vecino Virtual"}
        toolbarSubtitulo={"Mi perfil"}
        cargando={cargando}
        toolbarRenderLogo={this.renderLogo()}
        toolbarLeftIcon={"arrow_back"}
        toolbarLeftIconClick={this.onToolbarLeftIconClick}
        toolbarLeftIconClassName={classes.toolbarLeftIcon}
        toolbarClassName={classes.toolbar}
        toolbarMostrarUsuario={false}
        onToolbarTituloClick={this.onToolbarTituloClick}
      >
        <MiContent contentClassNames={classes.contentClassNames}>
          <React.Fragment>
            {/* Error  */}
            {this.renderError()}

            {/* Foto */}
            {this.renderFoto()}

            {/* Datos personales  */}
            {this.renderDatosPersonales()}

            {/* Datos de acceso  */}
            {this.renderDatosDeAcceso()}

            {/* Datos de contacto  */}
            {this.renderDatosDeContacto()}

            {/* Datos domicilio */}
            {this.renderDatosDomicilio()}

            {/* Dialogo username */}
            <MiDialogoInput
              titulo="Cambiar nombre de usuario"
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
              placeholder={"Contraseña actual"}
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
                    <FormControl className={classes.margin} fullWidth>
                      <Input
                        id="inputPasswordNueva"
                        value={this.state.dialogoPasswordPasswordNueva}
                        name="dialogoPasswordPasswordNueva"
                        multiline={false}
                        type="password"
                        autoComplete="new-password"
                        onChange={this.onDialogoPasswordInputChange}
                        placeholder={"Contraseña nueva"}
                        onKeyPress={this.onDialogoPasswordInputKeyPress}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl className={classes.margin} fullWidth>
                      <Input
                        id="inputPasswordNuevaRepeat"
                        value={this.state.dialogoPasswordPasswordNuevaRepeat}
                        name="dialogoPasswordPasswordNuevaRepeat"
                        multiline={false}
                        autoComplete="new-password"
                        type="password"
                        onChange={this.onDialogoPasswordInputChange}
                        placeholder={"Repita su nueva contraseña"}
                        onKeyPress={this.onDialogoPasswordInputKeyPress}
                      />
                    </FormControl>
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
        </MiContent>
      </MiPagina>
    );
  }

  renderError() {
    if (this.state.errorValidandoToken === undefined) return null;
    return <MiPanelMensaje error mensaje={this.state.errorValidandoToken} boton="Reintentar" onBotonClick={this.validarToken} />;
  }

  renderFoto() {
    let { classes, usuario } = this.props;

    if (this.state.errorValidandoToken || usuario === undefined) return null;

    let urlFotoPerfilMiniatura;
    if (usuario) {
      urlFotoPerfilMiniatura = CordobaFilesUtils.getUrlFotoMediana(this.state.identificadorFotoPersonal, usuario.sexoMasculino);
    }

    return (
      <div className={classNames(classes.contenedorFoto, this.state.contenedorFotoVisible && "visible")}>
        <input onChange={this.onFile} style={{ display: "none" }} ref={this.onFilePickerRef} type="file" id="pickerFile" accept="image/*" />

        <Avatar src={urlFotoPerfilMiniatura} className={classes.fotoPerfil} onClick={this.onBotonSeleccionarFotoClick} id="fotoPersonal" />
        <Typography variant="headline" className={classes.textoNombre}>{`${usuario.nombre} ${usuario.apellido}`}</Typography>
      </div>
    );
  }
  renderDatosPersonales() {
    let { classes, usuario } = this.props;

    if (this.state.errorValidandoToken || usuario === undefined) return null;

    return (
      <MiCard
        titulo="Datos personales"
        padding={false}
        rootClassName={classNames(classes.cardRoot, this.state.cardDatosPersonalesVisible && "visible")}
      >
        <MiBaner
          visible={this.state.mostrarBaner}
          mensaje="Como sus datos se encuentran validados por el Registro Nacional de Personas, estos no se pueden editar"
        />
        <div className={classes.contenedorTextos}>
          <MiItemDetalle titulo="Nombre" contenido={StringUtils.toTitleCase(`${usuario.nombre} ${usuario.apellido}`)} />
          <MiItemDetalle titulo="N° de Documento" contenido={usuario.dni} />
          <MiItemDetalle titulo="CUIL" contenido={usuario.cuil} />
          <MiItemDetalle
            titulo="Fecha de nacimiento"
            contenido={this.convertirFechaNacimientoString(this.convertirFechaStringToDate(usuario.fechaNacimiento))}
          />
          <MiItemDetalle titulo="Sexo" contenido={usuario.sexoMasculino ? "Masculino" : "Femenino"} />
          <MiItemDetalle titulo="Domicilio legal" contenido={usuario.domicilioLegal} />
        </div>
      </MiCard>
    );
  }

  renderDatosDeAcceso() {
    let { classes, usuario } = this.props;

    if (this.state.errorValidandoToken || usuario === undefined) return null;

    return (
      <MiCard
        titulo="Datos de acceso"
        padding={false}
        rootClassName={classNames(classes.cardRoot, this.state.cardDatosDeAccesoVisible && "visible")}
      >
        <MiBaner visible={this.state.mostrarErrorDatosDeAcceso} mensaje={this.state.errorDatosDeAcceso} modo="error" />
        <div className={classes.contenedorTextos}>
          <MiItemDetalle
            titulo="Nombre de usuario"
            contenido={usuario.username}
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
      </MiCard>
    );
  }

  renderDatosDeContacto() {
    let { classes, usuario } = this.props;
    let { errores, datosDeContacto } = this.state;
    datosDeContacto = datosDeContacto || {};

    if (this.state.errorValidandoToken || usuario === undefined) return null;

    return (
      <MiCard
        titulo="Datos de contacto"
        padding={false}
        rootClassName={classNames(classes.cardRoot, this.state.cardDatosDeContactoVisible && "visible")}
      >
        <MiBaner visible={this.state.mostrarErrorDatosDeContacto} mensaje={this.state.errorDatosDeContacto} modo="error" />
        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            {/* Email */}
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["email"] !== undefined}
                aria-describedby="emailError"
              >
                <Typography variant="body2">E-Mail</Typography>
                <Input
                  id="email"
                  name="email"
                  value={datosDeContacto.email}
                  onChange={this.onDatosDeContactoInputChange}
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                />
                <FormHelperText id="emailError">{errores.contacto["email"]}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Telefono celular</Typography>
            </Grid>
            {/* Celular caracteristica */}
            <Grid item xs={3} sm={2}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["telefonoCelularCaracteristica"] !== undefined}
                aria-describedby="telefonoCelularCaracteristicaError"
              >
                <Input
                  id="telefonoCelularCaracteristica"
                  name="telefonoCelularCaracteristica"
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  value={datosDeContacto.telefonoCelularCaracteristica}
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<InputAdornment position="start">0</InputAdornment>}
                />
                <FormHelperText id="telefonoCelularCaracteristicaError">{errores.contacto["telefonoCelularCaracteristica"]}</FormHelperText>
              </FormControl>
            </Grid>
            {/* Celular numero */}
            <Grid item xs={9} sm={4}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["telefonoCelularNumero"] !== undefined}
                aria-describedby="telefonoCelularNumeroError"
              >
                <Input
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  id="telefonoCelularNumero"
                  name="telefonoCelularNumero"
                  value={datosDeContacto.telefonoCelularNumero}
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<InputAdornment position="start">15</InputAdornment>}
                />
                <FormHelperText id="telefonoCelularNumeroError">{errores.contacto["telefonoCelularNumero"]}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Telefono fijo</Typography>
            </Grid>
            {/* Fijo caracteristica */}
            <Grid item xs={3} sm={2}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["telefonoFijoCaracteristica"] !== undefined}
                aria-describedby="telefonoFijoCaracteristicaError"
              >
                <Input
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  id="telefonoFijoCaracteristica"
                  name="telefonoFijoCaracteristica"
                  value={datosDeContacto.telefonoFijoCaracteristica}
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<InputAdornment position="start">0</InputAdornment>}
                />
                <FormHelperText id="telefonoFijoCaracteristicaError">{errores.contacto["telefonoFijoCaracteristica"]}</FormHelperText>
              </FormControl>
            </Grid>
            {/* Fijo numero */}
            <Grid item xs={9} sm={4}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["telefonoFijoNumero"] !== undefined}
                aria-describedby="telefonoFijoNumeroError"
              >
                <Input
                  id="telefonoFijoNumero"
                  name="telefonoFijoNumero"
                  value={datosDeContacto.telefonoFijoNumero}
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  onChange={this.onDatosDeContactoInputChange}
                />
                <FormHelperText id="telefonoFijoNumeroError">{errores.contacto["telefonoFijoNumero"]}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Redes */}
            <Grid item xs={12}>
              <Typography variant="body2">Redes sociales</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["facebook"] !== undefined}
                aria-describedby="facebookError"
              >
                <Input
                  id="facebook"
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  name="facebook"
                  value={datosDeContacto.facebook}
                  placeholder="Facebook"
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<Icon className="mdi mdi-facebook-box" />}
                />
                <FormHelperText id="facebookError">{errores.contacto["facebook"]}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["twitter"] !== undefined}
                aria-describedby="twitterError"
              >
                <Input
                  id="twitter"
                  name="twitter"
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  value={datosDeContacto.twitter}
                  placeholder="Twitter"
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<Icon className="mdi mdi-twitter-box" />}
                />
                <FormHelperText id="twitterError">{errores.contacto["twitter"]}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["instagram"] !== undefined}
                aria-describedby="instagramError"
              >
                <Input
                  id="instagram"
                  name="instagram"
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  value={datosDeContacto.instagram}
                  placeholder="Instagram"
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<Icon className="mdi mdi-instagram" />}
                />
                <FormHelperText id="instagramError">{errores.contacto["instagram"]}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl
                fullWidth
                className={classes.formControl}
                error={errores.contacto["linkedIn"] !== undefined}
                aria-describedby="linkedInError"
              >
                <Input
                  id="linkedIn"
                  name="linkedIn"
                  onKeyPress={this.onDatosDeContactoInputKeyPress}
                  value={datosDeContacto.linkedIn}
                  placeholder="LinkedIn"
                  onChange={this.onDatosDeContactoInputChange}
                  startAdornment={<Icon className="mdi mdi-linkedin-box" />}
                />
                <FormHelperText id="linkedInError">{errores.contacto["linkedIn"]}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </div>
        <div className={classes.contenedorBotones}>
          <Button variant="outlined" color="primary" onClick={this.onBotonGuardarCambiosDatosDeContactoClick}>
            Guardar cambios
          </Button>
        </div>
      </MiCard>
    );
  }

  renderDatosDomicilio() {
    let { classes, usuario } = this.props;
    let { errores, provincias, ciudades, datosDeDomicilio, barrios } = this.state;

    if (this.state.errorValidandoToken || usuario === undefined) return null;

    let urlMapa = undefined;
    if (usuario.domicilioDireccion && usuario.domicilioAltura && usuario.domicilioCiudadNombre && usuario.domicilioProvinciaNombre) {
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
      <MiCard
        titulo="Domicilio"
        padding={false}
        rootClassName={classNames(classes.cardRoot, this.state.cardDatosDomicilioVisible && "visible")}
      >
        <MiBaner visible={this.state.mostrarErrorDatosDomicilio} mensaje={this.state.errorDatosDomicilio} modo="error" />
        <div className={classes.contenedorTextos}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={urlMapa ? 9 : 12}>
              <Grid container spacing={16}>
                {/* Direccion */}
                <Grid item xs={12}>
                  <Typography variant="body2">Dirección</Typography>
                </Grid>
                <Grid item xs={9}>
                  <FormControl
                    fullWidth
                    className={classes.formControl}
                    error={errores.domicilio["direccion"] !== undefined}
                    aria-describedby="direccionError"
                  >
                    <Input
                      id="direccion"
                      name="direccion"
                      value={datosDeDomicilio.direccion}
                      placeholder="Calle"
                      onChange={this.onDatosDeDomicilioInputChange}
                      onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                    />
                    <FormHelperText id="direccionError">{errores.domicilio["direccion"]}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Altura */}
                <Grid item xs={3}>
                  <FormControl
                    fullWidth
                    className={classes.formControl}
                    error={errores.domicilio["altura"] !== undefined}
                    aria-describedby="alturaError"
                  >
                    <Input
                      id="altura"
                      name="altura"
                      value={datosDeDomicilio.altura}
                      placeholder="Altura"
                      onChange={this.onDatosDeDomicilioInputChange}
                      onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                    />
                    <FormHelperText id="alturaError">{errores.domicilio["altura"]}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Torre */}
                <Grid item xs={4} md={3}>
                  <FormControl
                    fullWidth
                    className={classes.formControl}
                    error={errores.domicilio["torre"] !== undefined}
                    aria-describedby="torreError"
                  >
                    <Input
                      id="torre"
                      name="torre"
                      value={datosDeDomicilio.torre}
                      placeholder="Torre"
                      onChange={this.onDatosDeDomicilioInputChange}
                      onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                    />
                    <FormHelperText id="torreError">{errores.domicilio["torre"]}</FormHelperText>
                  </FormControl>
                </Grid>
                {/* Piso */}
                <Grid item xs={4} md={3}>
                  <FormControl
                    fullWidth
                    className={classes.formControl}
                    error={errores.domicilio["piso"] !== undefined}
                    aria-describedby="pisoError"
                  >
                    <Input
                      id="piso"
                      name="piso"
                      value={datosDeDomicilio.piso}
                      placeholder="Piso"
                      onChange={this.onDatosDeDomicilioInputChange}
                      onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                    />
                    <FormHelperText id="psioError">{errores.domicilio["piso"]}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Depto */}
                <Grid item xs={4} md={3}>
                  <FormControl
                    fullWidth
                    className={classes.formControl}
                    error={errores.domicilio["depto"] !== undefined}
                    aria-describedby="deptoError"
                  >
                    <Input
                      id="depto"
                      name="depto"
                      value={datosDeDomicilio.depto}
                      placeholder="Depto"
                      onChange={this.onDatosDeDomicilioInputChange}
                      onKeyPress={this.onDatosDeDomicilioInputKeyPress}
                    />
                    <FormHelperText id="deptoError">{errores.domicilio["depto"]}</FormHelperText>
                  </FormControl>
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
                      value={datosDeDomicilio.idProvincia}
                      default={{ value: -1, label: "Seleccione..." }}
                      style={{ width: "100%" }}
                      label="Provincia"
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
                      default={{ value: -1, label: "Seleccione..." }}
                      disabled={datosDeDomicilio.idProvincia == undefined || datosDeDomicilio.idProvincia == -1}
                      value={datosDeDomicilio.idCiudad}
                      label="Ciudad"
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
                        default={{ value: -2, label: "Seleccione..." }}
                        value={datosDeDomicilio.idBarrio}
                        label="Barrio"
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
          <Button variant="outlined" color="primary" onClick={this.onBotonGuardarCambiosDatosDomicilioClick}>
            Guardar cambios
          </Button>
        </div>
      </MiCard>
    );
  }

  renderLogo() {
    const { classes, width } = this.props;

    let url = isWidthUp("md", width) ? ToolbarLogo : ToolbarLogo_Chico;
    return <div className={classes.logoMuni} style={{ backgroundImage: "url(" + url + ")" }} />;
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
