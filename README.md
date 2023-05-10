# capstone595

1. Clone project from the repo

2. Run `npm install`

3. To run the app use ng serve on local

4. Refer the test project for accessing the database collections (CRUD operations)

5. For now, no need to run separate project for firebase.

6. Make sure firebase tools are installed on your system.
    `npm install -g firebase-tools`

7. Login into firebase using CLI
        `firebase login`

8. To deploy first create a build using `ng build` and then run `firebase deploy`.

9. Firebase References:

    `https://www.bezkoder.com/angular-14-firestore-crud/`

    `https://firebase.google.com/docs/firestore/manage-data/add-data`

## getting the data
    `this.firestore
      .collection('/categories')
      .snapshotChanges()
      .subscribe((res) => {
        var list = res.map((e: any) => {
          var data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        });
        console.log(list)
      });`

## getting by id
    `this.firestore
      .collection('/categories')
      .doc('1')
      .snapshotChanges()
      .subscribe((res: any) => {
        console.log(res.payload.data());
      });`

## getting data by particular field
    `this.firestore
      .collection('/categories')
      .ref.where('name', '==', 'jkdsj')
      .get()
      .then((ref) => {
        let results = ref.docs.map((doc) => doc.data());
        console.log(results);
      });`

 ## for auto-ID
    `//this.firestore.collection("categories").add(this.form.value)`

## for your own ID
    `this.firestore
      .collection('categories')
      .doc(this.model.id.toString())
      .set(this.form.value);
    console.log(this.form.value);`
  }


## Accessing data using postman

https://firestore.googleapis.com/v1/projects/gethelp-e3129/databases/(default)/documents/`collectionname`