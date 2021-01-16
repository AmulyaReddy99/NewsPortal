var express = require('express');
var router = express.Router();
var ldap = require('ldapjs');
const Constants = require('../Constants');

// app.listen(3000, function () {
//     console.log("server started")
// })

/*update the url according to your ldap address*/
var client = ldap.createClient({
    url: Constants.LDAP_URL
});

/*use this to create connection*/
function authenticateDN(username, password) {

    /*bind use for authentication*/
    client.bind(username, password, function (err) {
        if (err) {
            console.log("Error in new connetion " + err)
        } else {
            /*if connection is success then go for any operation*/
            console.log("Success, connected to LDAP");
            //searchUser();
            // addUser();
            // deleteUser();
            //addUserToGroup('cn=Administrators,ou=groups,ou=system');
            //deleteUserFromGroup('cn=Administrators,ou=groups,ou=system');
            //updateUser('cn=test,ou=users,ou=system');
            //compare('cn=test,ou=users,ou=system');
            // modifyDN('cn=bar,ou=users,ou=system');

        }
    });
}

/*use this to search user, add your condition inside filter*/
router.post('/search', function searchUser(req, res) {
    var opts = {
        //  filter: '(objectClass=*)',  //simple search
        //  filter: '(&(uid=2)(sn=John))',// and search
        filter: '(|(uid=2)(sn=John)(cn=Smith))', // or search
        scope: 'sub',
        attributes: ['sn']
    };

    client.search('ou=users,ou=system', opts, function (err, res) {
        if (err) {
            console.log("Error in search " + err)
        } else {
            res.on('searchEntry', function (entry) {
                console.log('entry: ' + JSON.stringify(entry.object));
            });
            res.on('searchReference', function (referral) {
                console.log('referral: ' + referral.uris.join());
            });
            res.on('error', function (err) {
                console.error('error: ' + err.message);
            });
            res.on('end', function (result) {
                console.log('status: ' + result.status);
            });
        }
    });
})

/*use this to add user*/
router.post('/add', function addUser(req, res) {
    var entry = {
        sn: 'bar',
        // email: ['foo@bar.com', 'foo1@bar.com'],
        objectclass: 'inetOrgPerson'
    };
    client.add('cn=foo12,ou=users,ou=system', entry, function (err) {
        if (err) {
            console.log("err in new user " + err);
        } else {
            console.log("added user")
        }
    });
})

/*use this to delete user*/
router.post('/delete', function deleteUser(req, res) {
    client.del('cn=foo12,ou=users,ou=system', function (err) {
        if (err) {
            console.log("err in delete new user " + err);
        } else {
            console.log("deleted user")
        }
    });
})

/*use this to add user to group*/
router.post('/addToGroup', function addUserToGroup(req, res) {
    var change = new ldap.Change({
        operation: 'add',
        modification: {
            uniqueMember: 'cn=jill,ou=users,ou=system'
        }
    });

    client.modify(req.body.groupname, change, function (err) {
        if (err) {
            console.log("err in add user in a group " + err);
        } else {
            console.log("added user in a group")
        }
    });
})

/*use this to delete user from group*/
router.post('/deleteFromGroup', function deleteUserFromGroup(req, res) {
    var change = new ldap.Change({
        operation: 'delete',
        modification: {
            uniqueMember: 'cn=hiii,ou=users,ou=system'
        }
    });

    client.modify(req.body.groupname, change, function (err) {
        if (err) {
            console.log("err in delete  user in a group " + err);
        } else {
            console.log("deleted  user from a group")
        }
    });
})

/*use this to update user attributes*/
router.post('/update', function updateUser(req, res) {
    var change = new ldap.Change({
        operation: 'add',  //use add to add new attribute
        //operation: 'replace', // use replace to update the existing attribute
        modification: {
            displayName: '657'
        }
    });

    client.modify(req.body.dn, change, function (err) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("add update user");
        }
    });
})

/*use this to compare user is already existed or not*/
router.post('/compare', function compare(req, res) {
    client.compare(req.bodydn, 'sn', '1263', function (err, matched) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :" + matched);
        }
    });
})

/*use this to modify the dn of existing user*/
router.post('/modify', function modifyDN(req, res) {

    client.modifyDN(req.body.dn, 'cn=ba4r', function (err) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :");
        }
    });
})

/*create authentication*/
// authenticateDN("uid=admin,ou=system", "secret")

module.exports = {
    authenticateDN : authenticateDN,
    router: router
}