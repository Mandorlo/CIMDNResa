<template>
<div class="root_admin">
    <navbar title="Administration" :loggedin="true"></navbar>

    <div class="container container_admin">
      <div class="admin_options">
        <div class="admin_opt">
          <input type="checkbox" id="enable_signup" v-model="enable_signup">
          <label for="enable_signup">Activer l'inscription de nouveaux utilisateurs</label>
        </div>
        <div class="admin_opt">
          <input type="checkbox" id="enable_auth" v-model="enable_auth">
          <label for="enable_auth">Activer l'authentification</label>
        </div>
      </div>

      <div class="container_users">
        <div class="ligne user" v-for="user in users" :key="user.email">
          <div class="name">
            {{user.email}}<br><span class="roles" v-if="user.roles">Roles : {{user.roles.join(', ')}}</span>
          </div>
          <div class="flexEnd actions">
            <!-- <button class="btn bouton">Modifier le mot de passe</button> -->
            <i class="fas fa-trash delete" @click="deleteUser(user.email)"></i>
          </div>
        </div>

        <div class="add_user">
          <div class="title_add_user">
            Ajouter un nouvel utilisateur
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input type="text" class="form-control" v-model="new_user.email">
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" v-model="new_user.password">
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" v-model="new_user.confirm_password">
          </div>
          <div class="form-group">
            <label>Choisir le rôle de cet utilisateur</label>
            <select v-model="new_user.role">
              <option value="user">Utilisateur simple</option>
              <option value="admin">Administrateur (admin)</option>
            </select>
          </div>
          <div class="btn btn_primary" @click="addUser">Ajouter ce nouvel utilisateur</div>
        </div>
      </div>

    </div>
</div>
</template>

<style scoped>
.bouton {
  margin: 2px;
}

.add_user {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title_add_user {
  margin: 1rem;
}

.form-group > label {
  font-size: 0.7rem;
  line-height: 0.7rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    line-height: 2rem;
}

.container_admin {
  margin-top: 15vh;
}

.container_users {
  width: 60vw;
}

.admin_opt {
  margin-bottom: 1rem;
}

.user {
  display: flex;
}

.roles {
  color: var(--gray-color);
}

i.delete {
  color: red;
  cursor: pointer;
}
</style>

<script>
import Navbar from "./components/navbar.vue";

export default {
  name: "admin",
  components: {
    navbar: Navbar
  },
  data() {
    return {
      enable_signup: false,
      enable_auth: false,
      users: [],

      new_user: {
        email: '',
        password: '',
        confirm_password: '',
        role: 'user'
      }
    };
  },
  methods: {
    deleteUser: function(email) {
      if (confirm("Veux-tu vraiment supprimer l'utilisateur " + email + " ?")) {
          getJSON('/RFC/deleteUser/' + email).then(res => {
            this.users = this.users.filter(u => u.email != email)
          }).catch(err => {
            location.reload()
          })
      }
    },
    addUser: function() {
      if (this.new_user.email != '' && this.users.map(u => u.email).indexOf(this.new_user.email) < 0) {
        if (this.new_user.password != '' && this.new_user.password.length > 3) {
          if (this.new_user.password == this.new_user.confirm_password) {
            let data = {email: this.new_user.email, password: this.new_user.password};
            if (this.new_user.role != '' && this.new_user.role != 'user') data.roles = [this.new_user.role];
            getJSON('/RFC/createUser/' + JSON.stringify(data)).then(res => {
              location.reload()
            }).catch(err => {
              alert("Erreur lors de la création de l'utilisateur :(")
              console.log("ERR in addUser : ", err)
            })
          } else {
            alert("Les mots de passes ne sont pas identiques")
          }
        } else {
          alert("Le mot de passe est trop court (il faut minimum 4 caractères)")
        }
      } else {
        alert("L'utilisateur " + this.new_user.email + ' est vide ou existe déjà')
      }
    }
  },
  watch: {
    enable_auth: function (nouveau, ancien) {
      if (nouveau == ancien) return
      console.log("changé en ", nouveau)
      getJSON("/RFC/setEnableAuth/" + nouveau.toString())
        .then(enable_auth => {
          if (enable_auth != this.enable_auth) {
            console.log("Problème, enable_auth not in sync with server")
            location.reload()
          } else {
            console.log("ENABLE_AUTH NEW VAL", this.enable_auth);
          }
        })
        .catch(err => {
          console.log("ERROR in changing enable_auth", err);
        });
    },
    enable_signup: function (nouveau, ancien) {
      if (nouveau == ancien) return
      console.log("changé en ", nouveau)
      getJSON("/RFC/setSignup/" + nouveau.toString())
        .then(enable_signup => {
          if (enable_signup != this.enable_signup) {
            console.log("Problème, enable_signup not in sync with server")
            location.reload()
          } else {
            console.log("SIGNUP NEW VAL", this.enable_signup);
          }
        })
        .catch(err => {
          console.log("ERROR in changing signup", err);
        });
    }
  },
  mounted: function() {
    getJSON("/RFC/getAllUsers")
      .then(users => {
        this.users = obj2arr(users).filter(u => u.email != 'Admin');
        console.log("USERS", this.users);
      })
      .catch(err => {
        console.log("ERROR in getAllUsers", err);
      });
    
    getJSON("/RFC/setSignup")
      .then(enable_signup => {
        this.enable_signup = enable_signup;
        console.log("SIGNUP", this.enable_signup);
      })
      .catch(err => {
        console.log("ERROR in getting signup", err);
      });

    getJSON("/RFC/setEnableAuth")
      .then(enable_auth => {
        this.enable_auth = enable_auth;
        console.log("ENABLE_AUTH", this.enable_auth);
      })
      .catch(err => {
        console.log("ERROR in getting enable_auth", err);
      });
  }
};
</script>