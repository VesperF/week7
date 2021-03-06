// Step 2: Change main event listener from DOMContentLoaded to 
// firebase.auth().onAuthStateChanged and move code that 
// shows login UI to only show when signed out


// document.addEventListener('DOMContentLoaded', async function(event) {
 
firebase.auth().onAuthStateChanged( async function(user) {

  let db = firebase.firestore()

  if (user) {
    console.log('user logged in')

    //saving logging in info to our database:
    db.collection('users').doc(user.uid).set({
      name: user.displayName,
      email: user.email
    })


    document.querySelector('.sign-in-or-sign-out').innerHTML = `
    <a href='#' class="text-pink-500 underline">Sign out</a>
    `

    document.querySelector('.sign-out').addEventListener('click', function(event) {
      event.preventDefault()
      firebase.auth().signOut()
      document.location.href = 'todo.html'
    })


    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()
  
      let todoText = document.querySelector('#todo').value
  
      if (todoText.length > 0) {
        let docRef = await db.collection('todos').add({
          text: todoText,
          userID: user.uid
        })
  
        let todoId = docRef.id
        console.log(`new todo with ID ${todoId} created`)
  
        document.querySelector('.todos').insertAdjacentHTML('beforeend', `
          <div class="todo-${todoId} py-4 text-xl border-b-2 border-purple-500 w-full">
            <a href="#" class="done p-2 text-sm bg-green-500 text-white">✓</a>
            ${todoText}
          </div>
        `)
  
        document.querySelector(`.todo-${todoId} .done`).addEventListener('click', async function(event) {
          event.preventDefault()
          document.querySelector(`.todo-${todoId}`).classList.add('opacity-20')
          await db.collection('todos').doc(todoId).delete()
        })
        document.querySelector('#todo').value = ''
      }
    })
  
    // let querySnapshot = await db.collection('todos').get()
    // console.log(`Number to todos in collection: ${querySnapshot.size}`)

    let querySnapshot = await db.collection('todos')
    .where('userID', '==', user.uid)
    .get()
  
    let todos = querySnapshot.docs
    for (let i=0; i<todos.length; i++) {
      let todoId = todos[i].id
      let todo = todos[i].data()
      let todoText = todo.text
  
      document.querySelector('.todos').insertAdjacentHTML('beforeend', `
        <div class="todo-${todoId} py-4 text-xl border-b-2 border-purple-500 w-full">
          <a href="#" class="done p-2 text-sm bg-green-500 text-white">✓</a>
          ${todoText}
        </div>
      `)
  
      document.querySelector(`.todo-${todoId} .done`).addEventListener('click', async function(event) {
        event.preventDefault()
        document.querySelector(`.todo-${todoId}`).classList.add('opacity-20')
        await db.collection('todos').doc(todoId).delete()
      })
    }

  } else {
    console.log('no user')

    // Step 3: Hide the form when signed-out
    document.querySelector('form').classList.add('hidden')

    
  // Step 1: Un-comment to add FirebaseUI Auth
  // Initializes FirebaseUI Auth
  let ui = new firebaseui.auth.AuthUI(firebase.auth())

  // FirebaseUI configuration
  let authUIConfig = {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    signInSuccessUrl: 'todo.html'
  }

  // Starts FirebaseUI Auth
  ui.start('.sign-in-or-sign-out', authUIConfig)
  }

})

// Step 3: Hide the form when signed-out
// Step 4: Create a sign-out button
// Step 5: Add user ID to newly created to-do and only show my to-dos