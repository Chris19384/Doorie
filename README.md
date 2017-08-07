# Doorie
open your garage doors via your Android or any other web-enabled device!

## But Why? ##
We have   *2*   garages at our house.  
There are  *2*  radio controls to toggle the garage doors.  
There are  *3+*  people who want to be able to open & close the garages.  
All of those people own an android phone with internet access.  

## How? ##
Therefore, I took one radio control and opened it.  
It contains 4 SMD pushbuttons, but only two of them are used for our garages.  

Via a Raspberry Pi, it is easily possible to simulate button presses using two GPIO Pins.  
So now, there's a simple node.js webserver controlling the GPIO Pins and listening to webrequests.  
That's all :D  


### Circuit ###
- See [curcuit_v0.1](circuit/circuit_v0.1.dsn) (Open with TinyCad)  

Q: Why do you need 6 mosfets to control 2 simple pushbuttons?  
A: You don't. Use reed relays instead of mosfets if you can. I didn't have those in stock and used mosfets to get to know about how they work and how you usually get them to work :D  

### Software Used ###
* TinyCad: nice & simple tool for modelling small circuits  
* some more software goes here TODO  

### Code quality ###
This was a 1-weekend project, so there's probably a whole lot to improve here.  
Feel free to contribute in any way :)  
