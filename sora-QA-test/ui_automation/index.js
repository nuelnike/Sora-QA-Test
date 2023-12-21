const { remote } = require('webdriverio');

const cycle = 5; // number of test cycles
let iteration = 1; // cycle counter

// automation function
const automateFunc = async (username, password) => {

    const client = await remote({
      capabilities: {
        browserName: 'firefox',
      },
    });
  
    try {
          // 1st test case to check login using invalid username
          if(iteration == 1) await userLogin(client, 'dummy username text', password);
  
          // 2nd test case to check login using empty username
          else if(iteration == 2) await userLogin(client, ' ', password); 
          
          // 3rd test case to check login using invalid password
          else if(iteration == 3) await userLogin(client, username, 'dummy password text');
          
          // 4th test case to check login using emty password
          else if(iteration == 4) await userLogin(client, username, ' ');
          
          // 5th test case to confirm valid user login
          else if(iteration == 5)
          {
            await userLogin(client, username, password);
            // 6th test case to book appointment with empty date
            await bookAppointment(client, "invalid");
            // 6th test case to book appointment (valid)
            await bookAppointment(client, "valid");
            // 7th test case to check appointment history page
            await checkAppointments(client);
          }
  
    }
    catch (error) {
      console.error('Test failed:', error.message);
    } 
    finally {
      if(iteration < cycle)
      {
        iteration += 1; 
        await delay(1000);
        automateFunc('John Doe', 'ThisIsNotAPassword');
      } 
      await client.deleteSession();
    }
}

//user login
const userLogin = async (client, username, password) => {
  // Open the login page
  await client.url('https://katalon-demo-cura.herokuapp.com/profile.php#login');

  const usernameInput = await client.$('#txt-username');
  await usernameInput.setValue(username);

  const passwordInput = await client.$('#txt-password');
  await passwordInput.setValue(password);

  // Click the login button
  const loginBtn = await client.$('#btn-login');
  await loginBtn.click();

  // Wait for the login process to complete (adjust the selector and timeout as needed)
  await client.waitUntil(async () => {
      const page = await client.getUrl();
      if(iteration < cycle) return page.includes('login');
      else return page.includes('appointment');
  }, { timeout: 5000, timeoutMsg: 'Login process took too long' });

}

// book appointment
const bookAppointment = async (client, typ) => {
    // Open the login page
    await client.url('https://katalon-demo-cura.herokuapp.com/#appointment');

    const facility = await client.$('#combo_facility');
    await facility.selectByVisibleText("Tokyo CURA Healthcare Center");

    const chkBox = await client.$('#chk_hospotal_readmission');
    await chkBox.click();

    const program = await client.$('#radio_program_medicaid');
    await program.click();

    const date = await client.$('#txt_visit_date');
    let date_data = typ === "valid" ? `${getDate()}` : "00/00/0000"; // check if test cycle is for valid / invalid
    await date.setValue(date_data);
    
    const comment = await client.$('#txt_comment');
    await comment.setValue("this is a sample text comment");
    
    // Click the login button
    const submitBtn = await client.$('#btn-book-appointment');
    await submitBtn.click();

    await client.waitUntil(async () => {
        const page = await client.getUrl();
        return page.includes('summary');
    }, { timeout: 5000, timeoutMsg: 'Booking appointment took too long' });
}

// test history page
const checkAppointments = async (client) => {
    await client.url('https://katalon-demo-cura.herokuapp.com/history.php#history');
    await client.waitUntil(async () => { 
      const page = await client.getUrl();
      await delay(2000);
      return page.includes('history');
    }, { timeout: 5000, timeoutMsg: 'History page timed out' });      
}

//add delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//get today`s date function
const getDate = async () => {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth()+1; 
    var year = today.getFullYear();
    
    if(day<10) day = '0'+day;
    if(month<10) month = '0'+month; 

    return day+'/'+month+'/'+year;
}

//init test
automateFunc('John Doe', 'ThisIsNotAPassword');