/**
 * Created by Chandru on 01-07-2014.
 */

exports.validatingErrors = function (err) {
    var errors = {};
    if (err) {
        for (field in err.errors) {
            switch (err.errors[field].kind) {
                case 'required':
                    errors[field] = [field] + ' is Required';
                    break;
                case 'user defined':
                    errors[field] = 'Already Exist';
                    break;
                case 'enum':
                    errors[field] = 'Invalid ' + [field];
                    break;
                case 'Number':
                    errors[field] = [field] + ' must be a Number';
                    break;
                case 'Date':
                    errors[field] = [field] + ' must be a Valid Date';
                    break;
                case 'ObjectId':
                    errors[field] = [field] + ' is NotValid';
            }
            
        }
    }
    return errors;
};
